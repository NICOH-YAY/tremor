/* Original MUS/GENMIDI sequencer, GPL-2.0-or-later. FM core: Nuked OPL3. */
#include <math.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <emscripten.h>
#include "i_sound.h"
#include "w_wad.h"
#include "z_zone.h"
#include "../vendor/nuked-opl3/opl3.h"
static opl3_chip chip;
static unsigned char *bank,*score;
static int length,pos,startpos,active,looping,paused,rate=44100,volume=100;
static double wait_samples;
static int programs[16],velocities[16],levels[16],bends[16];
static struct { int on,ch,note,velocity,inst,voice; unsigned age; } voices[18];
static unsigned age;
static int song_serial;
EMSCRIPTEN_KEEPALIVE int tremor_music_song_serial(void){return song_serial;}
typedef struct {double time;unsigned tick,order;int type,ch,a,b;} midi_event;
static midi_event *midi;static int midi_count,midi_pos;static double midi_clock;
static unsigned be(unsigned char *p,int n){unsigned v=0;while(n--)v=(v<<8)|*p++;return v;}
static unsigned vlq(unsigned char **p,unsigned char *end){unsigned v=0;int i=0;while(*p<end&&i++<4){int b=*(*p)++;v=(v<<7)|(b&127);if(!(b&128))break;}return v;}
static int compare_event(const void *a,const void *b){const midi_event *x=a,*y=b;return x->tick<y->tick?-1:x->tick>y->tick?1:x->order<y->order?-1:x->order>y->order;}
static int parsemidi(unsigned char *data,int n){
 if(n<14||be(data+4,4)!=6||be(data+12,2)==0||(data[12]&128))return 0;
 unsigned division=be(data+12,2),tracks=be(data+10,2);unsigned char *p=data+14,*end=data+n;
 midi=calloc(n,sizeof(*midi));if(!midi)return 0;midi_count=0;
 for(unsigned tr=0;tr<tracks;tr++){if(end-p<8||memcmp(p,"MTrk",4))goto bad;unsigned size=be(p+4,4);p+=8;if(size>(unsigned)(end-p))goto bad;unsigned char *te=p+size;unsigned tick=0;int running=0;
 while(p<te){tick+=vlq(&p,te);if(p>=te)goto bad;int status=*p;if(status&128){p++;if(status<240)running=status;}else status=running;if(!status)goto bad;
 int type=status>>4,ch=status&15,a=0,b=0; if(ch==9)ch=15;else if(ch==15)ch=9;
 if(status==255){if(p>=te)goto bad;int meta=*p++;unsigned len=vlq(&p,te);if(len>(unsigned)(te-p))goto bad;if(meta==81&&len==3)midi[midi_count++]=(midi_event){0,tick,(unsigned)(p-data),15,0,(int)be(p,3),0};if(meta==47)midi[midi_count++]=(midi_event){0,tick,(unsigned)(p-data),0,0,0,0};p+=len;}
 else if(status==240||status==247){unsigned len=vlq(&p,te);if(len>(unsigned)(te-p))goto bad;p+=len;}
 else if(type>=8&&type<=14){if(p>=te)goto bad;a=*p++;if(type!=12&&type!=13){if(p>=te)goto bad;b=*p++;}midi[midi_count++]=(midi_event){0,tick,(unsigned)(p-data),type,ch,a,b};}else goto bad;
 }p=te;}
 qsort(midi,midi_count,sizeof(*midi),compare_event);double time=0;unsigned tick=0,tempo=500000;for(int i=0;i<midi_count;i++){time+=(midi[i].tick-tick)*(double)tempo/(division*1000000.0);tick=midi[i].tick;midi[i].time=time;if(midi[i].type==15)tempo=midi[i].a;}return midi_count>0;
 bad:free(midi);midi=NULL;midi_count=0;return 0;
}

static int16_t output[4096*2];
static const int offsets[9]={0,1,2,8,9,10,16,17,18};
static void reg(int r,int v){OPL3_WriteRegBuffered(&chip,r,v);}
static int u16(unsigned char *p){return p[0]|p[1]<<8;}
static void off(int v){reg((v/9)*256+0xb0+v%9,0);voices[v].on=0;}
static void silence(void){int v;for(v=0;v<18;v++)off(v);}
static void reset(void){int c;OPL3_Reset(&chip,rate);reg(0x105,1);reg(1,32);memset(voices,0,sizeof(voices));for(c=0;c<16;c++){programs[c]=0;velocities[c]=100;levels[c]=127;bends[c]=128;}}
static void pitch(int v){int c=voices[v].ch,n=voices[v].note,inst=voices[v].inst;unsigned char *i=bank+8+inst*36,*p=i+4+voices[v].voice*16;double note=n;
 if(u16(i)&1)note=i[3];if(c==15)note=i[3];
 note+=(int16_t)u16(p+14); if(voices[v].voice)note+=((int)i[2]-128)/64.0;
 note+=(bends[c]-128)/64.0;double hz=440*pow(2,(note-69)/12);int block=0,f=(int)(hz*1048576/49716);
 while(f>1023 && block<7){f>>=1;block++;}if(f>1023)f=1023;if(f<0)f=0;
 reg(v/9*256+0xa0+v%9,f&255);reg(v/9*256+0xb0+v%9,32|(block<<2)|(f>>8));}
static void gainvoice(int v){unsigned char *p=bank+8+voices[v].inst*36+4+voices[v].voice*16;int base=v/9*256,o=offsets[v%9],atten=(127-voices[v].velocity*levels[voices[v].ch]/127)*63/127;
 int a=(p[5]&63)+((p[6]&1)?atten:0),b=(p[12]&63)+atten;if(a>63)a=63;if(b>63)b=63;
 reg(base+0x40+o,(p[4]&192)|a);reg(base+0x43+o,(p[11]&192)|b);}
static void noteon(int ch,int note){int inst=ch==15?128+note-35:programs[ch];if(inst<0||inst>=175)return;unsigned char *i=bank+8+inst*36;int count=(u16(i)&4)?2:1;
 for(int k=0;k<count;k++){int v=0;for(int j=0;j<18;j++){if(!voices[j].on){v=j;break;}if(voices[j].age<voices[v].age)v=j;}off(v);voices[v].on=1;voices[v].ch=ch;voices[v].note=note;voices[v].velocity=velocities[ch];voices[v].inst=inst;voices[v].voice=k;voices[v].age=++age;
 unsigned char *p=i+4+k*16;int base=v/9*256,o=offsets[v%9];
 for(int op=0;op<2;op++){unsigned char *q=p+op*7;int x=base+o+op*3;reg(0x20+x,q[0]);reg(0x60+x,q[1]);reg(0x80+x,q[2]);reg(0xe0+x,q[3]);}
 reg(base+0xc0+v%9,0x30|p[6]);gainvoice(v);pitch(v);
 }}
static int nextbyte(void){if(pos>=length){active=0;return 0;}return score[pos++];}
static void midievents(void){
 int budget=midi_count+1;
 while(active&&midi_pos<midi_count&&midi[midi_pos].time<=midi_clock&&--budget){midi_event *e=&midi[midi_pos++];int ch=e->ch,a=e->a,b=e->b;
 if(e->type==8||(e->type==9&&!b)){for(int v=0;v<18;v++)if(voices[v].on&&voices[v].ch==ch&&voices[v].note==a)off(v);}
 else if(e->type==9){velocities[ch]=b;noteon(ch,a);}
 else if(e->type==12)programs[ch]=a;
 else if(e->type==14){bends[ch]=(a+(b<<7))/64;for(int v=0;v<18;v++)if(voices[v].on&&voices[v].ch==ch)pitch(v);}
 else if(e->type==11){if(a==7){levels[ch]=b;for(int v=0;v<18;v++)if(voices[v].on&&voices[v].ch==ch)gainvoice(v);}if(a==120||a==123)for(int v=0;v<18;v++)if(voices[v].ch==ch)off(v);}
 }
 if(midi_pos>=midi_count){if(looping){reset();midi_pos=0;midi_clock=0;}else{active=0;silence();}}
 midi_clock+=1.0/rate;
}
static void events(void){int budget=65536;while(active && wait_samples<=0 && --budget){int e=nextbyte(),ch=e&15,t=(e>>4)&7,a,b;
 switch(t){case 0:a=nextbyte()&127;for(int v=0;v<18;v++)if(voices[v].on&&voices[v].ch==ch&&voices[v].note==a)off(v);break;
 case 1:a=nextbyte();if(a&128)velocities[ch]=nextbyte()&127;noteon(ch,a&127);break;
 case 2:bends[ch]=nextbyte();for(int v=0;v<18;v++)if(voices[v].on&&voices[v].ch==ch)pitch(v);break;
 case 3:a=nextbyte();if(a==10||a==11)for(int v=0;v<18;v++)if(voices[v].ch==ch)off(v);break;
 case 4:a=nextbyte();b=nextbyte();if(a==0)programs[ch]=b&127;if(a==3){levels[ch]=b&127;for(int v=0;v<18;v++)if(voices[v].on&&voices[v].ch==ch)gainvoice(v);}break;
 case 6:if(looping){pos=startpos;silence();}else{active=0;silence();}break;
 default:active=0;break;}
 if(e&128){unsigned delay=0;int n=0;do{a=nextbyte();delay=(delay<<7)|(a&127);}while((a&128)&&++n<5&&active);wait_samples+=delay*(double)rate/140;}
 }if(!budget)active=0;}
EMSCRIPTEN_KEEPALIVE int tremor_music_render(int frames){if(frames<0)frames=0;if(frames>4096)frames=4096;for(int i=0;i<frames;i++){if(active&&!paused){if(midi)midievents();else events();OPL3_GenerateResampled(&chip,output+i*2);output[i*2]=output[i*2]*volume/127;output[i*2+1]=output[i*2+1]*volume/127;wait_samples-=1;}else output[i*2]=output[i*2+1]=0;}return (int)output;}
EMSCRIPTEN_KEEPALIVE void tremor_music_rate(int hz){if(hz>=8000&&hz<=192000){rate=hz;reset();}}
EMSCRIPTEN_KEEPALIVE int tremor_music_active(void){return active;}
static boolean initmusic(void){int l=W_CheckNumForName("GENMIDI");if(l<0||W_LumpLength(l)<8+175*36)return false;bank=W_CacheLumpNum(l,PU_STATIC);reset();return true;}
static void stopmusic(void){active=0;silence();}
static void setvolume(int v){volume=v<0?0:v>127?127:v;}
static void pausemusic(void){paused=1;}static void resumemusic(void){paused=0;}
static void *registersong(void *data,int n){unsigned char *p=data;free(midi);midi=NULL;midi_count=0;if(n>=4&&!memcmp(p,"MThd",4))return parsemidi(p,n)?data:NULL;if(n<16||memcmp(p,"MUS\032",4)||u16(p+6)<16||u16(p+6)+u16(p+4)>n)return NULL;score=p;length=u16(p+6)+u16(p+4);startpos=u16(p+6);return data;}
static void unregistersong(void *h){stopmusic();score=NULL;free(midi);midi=NULL;midi_count=0;}
static void playsong(void *h,boolean loop){if(!h||!bank)return;++song_serial;reset();midi_pos=0;midi_clock=0;pos=startpos;wait_samples=0;looping=loop;paused=0;active=1;}
static boolean isplaying(void){return active;}static void noopmusic(void){}
static snddevice_t musicdevices[]={SNDDEVICE_SB,SNDDEVICE_ADLIB,SNDDEVICE_GENMIDI};
music_module_t DG_music_module={musicdevices,3,initmusic,stopmusic,setvolume,pausemusic,resumemusic,registersong,unregistersong,playsong,stopmusic,isplaying,noopmusic};
