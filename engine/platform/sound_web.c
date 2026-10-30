
// Tremor DMX playback bridge, GPL-2.0-or-later.
#include <stdio.h>
#include <emscripten.h>
#include "i_sound.h"
#include "w_wad.h"
#include "z_zone.h"
int use_libsamplerate=0; float libsamplerate_scale=1;
static boolean init(boolean prefix) { return true; }
static void noop(void) {}
static int lump(sfxinfo_t *s) { char n[12];snprintf(n,sizeof(n),"ds%s",s->name);return W_GetNumForName(n); }
EM_JS(void, params,(int c,int v,int s),{Module.audio?.params(c,v,s);});
EM_JS(void, stop,(int c),{Module.audio?.stop(c);});
EM_JS(int, playing,(int c),{return Module.audio?.playing(c)?1:0;});
EM_JS(void, play,(int c,int p,int n,int rate,int v,int s,int name),{Module.audio?.play(c,HEAPU8.slice(p,p+n),rate,v,s,UTF8ToString(name));});
static void update(int c,int v,int s) { params(c,v,s); }
static int start(sfxinfo_t *s,int c,int v,int sep) {
 int l=s->lumpnum,n=W_LumpLength(l);unsigned char *d=W_CacheLumpNum(l,PU_STATIC);
 if(n<40||d[0]!=3||d[1]!=0) { W_ReleaseLumpNum(l);return -1; }
 unsigned count=d[4]|d[5]<<8|d[6]<<16|d[7]<<24;int rate=d[2]|d[3]<<8;
 if(count>32&&count<=(unsigned)(n-8)&&rate>0) play(c,(int)(d+24),count-32,rate,v,sep,(int)s->name);
 W_ReleaseLumpNum(l);return c;
}
static boolean active(int c) { return playing(c); }
static snddevice_t devices[]={SNDDEVICE_SB};
sound_module_t DG_sound_module={devices,1,init,noop,lump,noop,update,start,stop,active,NULL};
