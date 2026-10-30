/* Original Tremor agent adapter, GPL-2.0-or-later. No privileged data in observations. */
#include <stdio.h>
#include <stdarg.h>
#include <string.h>
#include <math.h>
#include <emscripten.h>
#include "doomgeneric.h"
#include "doomstat.h"
#include "g_game.h"
#include "r_local.h"
#include "v_video.h"
#include "i_video.h"
#include "tremor.h"
#define STEP_TICS 7
int tr_agent_seed;
extern gameaction_t gameaction;
void R_ExecuteSetViewSize(void);
extern int tr_kills_demons,tr_kills_humans,tr_crew_killed,tr_reads,tr_fired_unread;
static int initialized,tics,steps,terminal;
static ticcmd_t commands[MAXPLAYERS];
static char json[65536],messages[5][256];
static int used,nmessages;
static void add(const char *fmt,...){va_list ap;va_start(ap,fmt);int n=vsnprintf(json+used,sizeof(json)-used,fmt,ap);va_end(ap);if(n>0)used+=n;if(used>sizeof(json)-1)used=sizeof(json)-1;}
static void quoted(const char *s){add("\"");for(;*s;s++){unsigned char c=*s;if(c=='"'||c=='\\')add("\\%c",c);else if(c>=32&&c<127)add("%c",c);else add(" ");}add("\"");}
void TR_AgentMessage(const char *text){if(!text)return;if(nmessages==5){memmove(messages,messages+1,4*sizeof(messages[0]));nmessages=4;}snprintf(messages[nmessages++],256,"%s",text);}
EMSCRIPTEN_KEEPALIVE void tremor_agent_reset(int seed,int episode,int map,int skill){
 tr_agent_seed=seed;terminal=tics=steps=nmessages=0;
 if(!initialized){
  static char *argv[]={"tremor-agent","-iwad","/freedoom1.wad","-file","/tremor.wad","-nosound","-warp","1","1"};
  doomgeneric_Create(9,argv);I_InitGraphics();V_RestoreBuffer();R_ExecuteSetViewSize();initialized=1;
 }
 gametic=0;memset(commands,0,sizeof(commands));netcmds=commands;
 G_InitNew((skill_t)(skill<0?0:skill>4?4:skill),episode,map);
 players[0].message=NULL;R_RenderPlayerView(&players[0]);
}
static void check_terminal(void){if(players[0].health<=0)terminal=2;else if(gameaction==ga_completed||gamestate!=GS_LEVEL)terminal=1;}
EMSCRIPTEN_KEEPALIVE int tremor_agent_step(int action){
 if(terminal)return 0;
 ticcmd_t c={0};
 switch(action){
 case 0:c.forwardmove=25;break;case 1:c.forwardmove=-25;break;
 case 2:c.sidemove=-24;break;case 3:c.sidemove=24;break;
 case 4:c.angleturn=910;break;case 5:c.angleturn=2341;break;
 case 6:c.angleturn=-910;break;case 7:c.angleturn=-2341;break;
 case 8:c.buttons=BT_ATTACK;break;case 9:c.buttons=BT_USE;break;
 case 10:c.buttons2=TR_READ;break;case 11:c.buttons2=TR_STUN;break;case 12:c.buttons2=TR_PURGE;break;
 case 14:c.buttons=BT_CHANGE|(wp_fist<<BT_WEAPONSHIFT);break;
 case 15:c.buttons=BT_CHANGE|(wp_pistol<<BT_WEAPONSHIFT);break;
 case 16:c.buttons=BT_CHANGE|(wp_shotgun<<BT_WEAPONSHIFT);break;
 }
 for(int i=0;i<STEP_TICS;i++){
  // Finish the fixed interval with neutral input after a terminal transition.
  // This prevents USE respawning a dead player while retaining exactly 7 tics.
  commands[0]=terminal?(ticcmd_t){0}:c;netcmds=commands;G_Ticker();++gametic;++tics;if(!terminal)check_terminal();
  if(gamestate==GS_LEVEL)R_RenderPlayerView(&players[0]);
 }
 if(++steps>=600&&!terminal)terminal=3;
 return 1;
}
static const char *label(mobj_t *m){
 if(TR_Human(m))return !m->tr_revealed?"unknown figure":m->tr_crew?"crew":"possessed";
 switch(m->type){case MT_TROOP:return "Imp";case MT_SERGEANT:return "Demon";case MT_SHADOWS:return "Spectre";case MT_HEAD:return "Cacodemon";case MT_BRUISER:return "Baron of Hell";case MT_KNIGHT:return "Hell Knight";case MT_SKULL:return "Lost Soul";case MT_CYBORG:return "Cyberdemon";case MT_SPIDER:return "Spider Mastermind";case MT_UNDEAD:return "Revenant";case MT_FATSO:return "Mancubus";case MT_VILE:return "Arch-vile";case MT_BABY:return "Arachnotron";case MT_PAIN:return "Pain Elemental";default:break;}
 if(!(m->flags&MF_SPECIAL))return NULL;
 switch(m->sprite){case SPR_ARM1:return "green armor";case SPR_ARM2:return "blue armor";case SPR_STIM:return "stimpack";case SPR_MEDI:return "medikit";case SPR_CLIP:return "clip";case SPR_AMMO:return "box of bullets";case SPR_SHEL:return "shells";case SPR_SBOX:return "box of shells";case SPR_ROCK:return "rocket";case SPR_BROK:return "box of rockets";case SPR_CELL:return "energy cell";case SPR_CELP:return "cell pack";case SPR_BPAK:return "backpack";case SPR_SHOT:return "shotgun";case SPR_SGN2:return "super shotgun";case SPR_MGUN:return "chaingun";case SPR_CSAW:return "chainsaw";case SPR_LAUN:return "rocket launcher";case SPR_PLAS:return "plasma rifle";case SPR_BFUG:return "BFG9000";case SPR_BKEY:return "blue key";case SPR_YKEY:return "yellow key";case SPR_RKEY:return "red key";case SPR_BSKU:return "blue skull key";case SPR_YSKU:return "yellow skull key";case SPR_RSKU:return "red skull key";case SPR_BON1:return "health bonus";case SPR_BON2:return "armor bonus";case SPR_SOUL:return "soul sphere";case SPR_MEGA:return "megasphere";case SPR_PINV:return "invulnerability";case SPR_PSTR:return "berserk";case SPR_PINS:return "partial invisibility";case SPR_SUIT:return "radiation suit";case SPR_PMAP:return "computer map";case SPR_PVIS:return "light amplification";default:return "supply";}
}
#define SIDE 25
#define CELL 64
static void automap(player_t *p){
 char grid[SIDE][SIDE];memset(grid,'?',sizeof(grid));
 // The ticker updates ML_MAPPED using software visibility, independently of
 // observe calls. Reading the map cannot change discovery or gameplay.
 double px=(double)p->mo->x/FRACUNIT,py=(double)p->mo->y/FRACUNIT;
 int ox=(int)floor(px/CELL)-SIDE/2,oy=(int)floor(py/CELL)-SIDE/2;
 for(int i=0;i<numlines;i++)if(lines[i].flags&ML_MAPPED){
  line_t *l=&lines[i];double x=(double)l->v1->x/FRACUNIT,y=(double)l->v1->y/FRACUNIT,dx=(double)l->dx/FRACUNIT,dy=(double)l->dy/FRACUNIT;
  int n=(int)(fmax(fabs(dx),fabs(dy))/16)+1;
  for(int j=0;j<=n;j++){int gx=(int)floor((x+dx*j/n)/CELL)-ox,gy=(int)floor((y+dy*j/n)/CELL)-oy;if(gx>=0&&gx<SIDE&&gy>=0&&gy<SIDE)grid[gy][gx]=(l->flags&ML_TWOSIDED)?'.':'#';}
 }
 int facing=(int)((p->mo->angle+ANG45)/ANG90)&3;grid[SIDE/2][SIDE/2]=">^<v"[facing];
 add("\"automap\":\"");for(int y=SIDE-1;y>=0;y--){for(int x=0;x<SIDE;x++)add("%c",grid[y][x]);if(y)add("\\n");}add("\",\"map_cell_units\":64");
}
EMSCRIPTEN_KEEPALIVE const char *tremor_agent_observe(void){
 player_t *p=&players[0];used=0;
 const char *weapons[]={"fist","pistol","shotgun","chaingun","rocket launcher","plasma rifle","BFG9000","chainsaw","super shotgun"};
 add("{\"tic\":%d,\"health\":%d,\"armor\":%d,\"rounds\":%d,\"purge\":%d,\"weapon\":\"%s\",\"aim\":\"%s\",\"keys\":[",tics,p->health<0?0:p->health,p->armorpoints,tr_rounds,tr_charges,weapons[p->readyweapon],tr_trauma==0?"steady":tr_trauma<3?"shaky":"very shaky");
 const char *keys[]={"blue key","yellow key","red key","blue skull","yellow skull","red skull"};int comma=0;
 for(int i=0;i<NUMCARDS;i++)if(p->cards[i]){if(comma++)add(",");quoted(keys[i]);}add("],\"entities\":[");comma=0;
 for(thinker_t *th=thinkercap.next;th!=&thinkercap;th=th->next){
  if(th->function.acp1!=(actionf_p1)P_MobjThinker)continue;
  mobj_t *m=(mobj_t*)th;if(m==p->mo||m->health<=0)continue;const char *name=label(m);if(!name)continue;
  double a=(double)(int32_t)(R_PointToAngle2(p->mo->x,p->mo->y,m->x,m->y)-p->mo->angle)*360.0/4294967296.0;
  if(fabs(a)>45||!P_CheckSight(p->mo,m))continue;
  if(comma++)add(",");add("{\"bearing_deg\":%.2f,\"distance\":%.2f,\"type\":",a,hypot((double)m->x-p->mo->x,(double)m->y-p->mo->y)/FRACUNIT);quoted(name);add("}");
 }
 add("],");automap(p);add(",\"events\":[");for(int i=0;i<nmessages;i++){if(i)add(",");quoted(messages[i]);}add("]}");return json;
}
EMSCRIPTEN_KEEPALIVE const char *tremor_agent_outcome(void){
 used=0;const char *reasons[]={"null","\"exit\"","\"dead\"","\"step_limit\"","\"call_limit\"","\"timeout\""};
 add("{\"status\":\"%s\",\"reason\":%s,\"score\":%d,\"metrics\":{\"kills_demons\":%d,\"kills_humans\":%d,\"crew_killed\":%d,\"crew_saved\":%d,\"reads\":%d,\"fired_unread\":%d,\"rounds_left\":%d,\"final_tremor\":%d,\"tics\":%d}}",terminal?"terminal":"ongoing",reasons[terminal],terminal==1?100:0,tr_kills_demons,tr_kills_humans,tr_crew_killed,tr_saved,tr_reads,tr_fired_unread,tr_rounds,tr_trauma,tics);return json;
}
EMSCRIPTEN_KEEPALIVE void tremor_agent_terminate(int reason){if(!terminal&&reason>=3&&reason<=5)terminal=reason;}

#ifdef TR_AGENT_TEST
#include "p_inter.h"
// Test fixtures are absent from the production artifact and controller interface.
EMSCRIPTEN_KEEPALIVE void tremor_agent_fixture(int crew){
 thinker_t *th=thinkercap.next;
 while(th!=&thinkercap){thinker_t *next=th->next;if(th->function.acp1==(actionf_p1)P_MobjThinker){mobj_t *m=(mobj_t*)th;if(!m->player)P_RemoveMobj(m);}th=next;}
 player_t *p=&players[0];p->mo->angle=0;
 mobj_t *m=P_SpawnMobj(p->mo->x+48*FRACUNIT,p->mo->y,ONFLOORZ,MT_POSSESSED);
 m->tr_crew=crew;m->tr_stun=1000;m->flags&=~MF_COUNTKILL;
}
EMSCRIPTEN_KEEPALIVE void tremor_agent_test_cower(void){for(thinker_t *th=thinkercap.next;th!=&thinkercap;th=th->next)if(th->function.acp1==(actionf_p1)P_MobjThinker){mobj_t *m=(mobj_t*)th;if(TR_Human(m)){m->tr_crew=m->tr_revealed=1;m->tr_cower=35;m->frame=6;}}}
EMSCRIPTEN_KEEPALIVE int tremor_agent_test_exit_fixture(void){
 // Put the player on the front of a real E1M1 exit switch for a boundary test.
 player_t *p=&players[0];
 for(int i=0;i<numlines;i++)if(lines[i].special==11){
  line_t *l=&lines[i];double dx=l->dx,dy=l->dy,len=hypot(dx,dy);
  fixed_t x=l->v1->x+l->dx/2,y=l->v1->y+l->dy/2;
  P_UnsetThingPosition(p->mo);p->mo->x=x+(fixed_t)(dy/len*8*FRACUNIT);p->mo->y=y-(fixed_t)(dx/len*8*FRACUNIT);P_SetThingPosition(p->mo);
  p->mo->z=p->mo->floorz=p->mo->subsector->sector->floorheight;p->mo->ceilingz=p->mo->subsector->sector->ceilingheight;
  p->mo->angle=R_PointToAngle2(p->mo->x,p->mo->y,x,y);p->mo->momx=p->mo->momy=0;return 1;
 }return 0;
}
EMSCRIPTEN_KEEPALIVE int tremor_agent_enemy_count(void){return totalkills;}
EMSCRIPTEN_KEEPALIVE int tremor_agent_test_crew_damage(void){
 player_t *p=&players[0];mobj_t *m=P_SpawnMobj(p->mo->x+48*FRACUNIT,p->mo->y,ONFLOORZ,MT_POSSESSED);m->tr_crew=1;
 int health=p->health;P_DamageMobj(p->mo,m,m,1000);return p->health==health&&TR_BlockDamage(m);
}
EMSCRIPTEN_KEEPALIVE void tremor_agent_test_kill(int human){
 player_t *p=&players[0];mobj_t *m=P_SpawnMobj(p->mo->x+48*FRACUNIT,p->mo->y,ONFLOORZ,human?MT_POSSESSED:MT_TROOP);tr_gore=human==2?2:0;P_DamageMobj(m,p->mo,p->mo,10000);
}
#endif
