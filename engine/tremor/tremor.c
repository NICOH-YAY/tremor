/* Original Tremor implementation. GPL-2.0-or-later. */
#include "tremor.h"
#include "doomstat.h"
#include "r_local.h"
#include "m_random.h"
#include "m_controls.h"
#include "s_sound.h"
#include "sounds.h"
#include "w_wad.h"
#include "z_zone.h"
#include <emscripten.h>
#include <stdlib.h>
#include <string.h>

int tr_kills_demons,tr_kills_humans,tr_crew_killed,tr_reads,tr_fired_unread;
int tr_keys[3]={'r','f','q'};
int tr_pitch,tr_sway=100,tr_autoaim=1;
static int mouse_unbuilt,mouse_pending,mouse_last;
static int look_pending;
int tr_terror;
static int corpse_cursor;
int tr_last_corpse;
#define last_corpse tr_last_corpse
int tr_trauma,tr_rounds,tr_charges,tr_saved,tr_gore=2;
static mobj_t *read_target,*purge_target;
static int screen_shake=1;
static int read_tics,purge_tics,stun_cooldown,kick,damaged;
extern int mouseSensitivity;
void P_SetPsprite(player_t *, int, statenum_t);
#ifndef TR_HEADLESS
EM_JS(int, tr_has_intro, (), { return Module.onIntro?1:0; });
EM_ASYNC_JS(void, tr_intro, (), { if(Module.onIntro) await Module.onIntro(); });
#else
static int tr_has_intro(void){return 0;}
static void tr_intro(void){}
#endif
static int clamp(int v,int max) { return v<0?0:v>max?max:v; }
int TR_Human(mobj_t *m) { return m && (m->type==MT_POSSESSED || m->type==MT_SHOTGUY || m->type==MT_CHAINGUY); }
static void syncammo(player_t *p) { int i; for(i=0;i<NUMAMMO;i++) p->ammo[i]=tr_rounds; }
void TR_NewGame(void) { mouse_unbuilt=mouse_pending=mouse_last=0; TR_Radio(-1); tr_pitch=0; tr_terror=0; tr_trauma=0; tr_kills_demons=tr_kills_humans=tr_crew_killed=tr_reads=tr_fired_unread=0; }
void TR_MapSpawn(mobj_t *m) {
 if ((m->type==MT_POSSESSED || m->type==MT_SHOTGUY) && P_Random()<TR_CREW_THRESHOLD) {
  m->tr_crew=1; m->flags &= ~MF_COUNTKILL;
 }
}
void TR_LevelStart(void) {
 int i;
 TR_StoryStart(); tr_terror/=2; corpse_cursor=last_corpse=0;
 /* TREMOR: thin only map ammunition, before any death drops exist. */
 { thinker_t *th=thinkercap.next; while(th!=&thinkercap) { thinker_t *next=th->next;
 if(th->function.acp1==(actionf_p1)P_MobjThinker) { mobj_t *m=(mobj_t*)th;
 if((m->sprite==SPR_CLIP || m->sprite==SPR_AMMO || m->sprite==SPR_SHEL || m->sprite==SPR_SBOX || m->sprite==SPR_ROCK || m->sprite==SPR_BROK || m->sprite==SPR_CELL || m->sprite==SPR_CELP) && P_Random()>=TR_AMMO_KEEP) P_RemoveMobj(m); } th=next; } }
 if(gameepisode==1 && gamemap==1 && tr_has_intro()) tr_intro();
 tr_rounds=totalkills+1; tr_charges=TR_PURGE_CHARGES; tr_saved=0;
 read_target=purge_target=NULL; read_tics=purge_tics=stun_cooldown=kick=damaged=0;
 for(i=0;i<MAXPLAYERS;i++) if(playeringame[i]) {
  player_t *p=&players[i]; int w;
  for(w=0;w<NUMWEAPONS;w++) p->weaponowned[w]=(w==wp_fist || w==wp_pistol);
  p->readyweapon=wp_pistol; p->pendingweapon=wp_nochange; syncammo(p); P_SetupPsprites(p);
 }
}
int TR_BlockDamage(mobj_t *source) { return source && source->tr_crew; }
void TR_Damaged(mobj_t *m) {
 if(m->player) { damaged=1; purge_tics=0; purge_target=NULL; }
 if(TR_Human(m)) m->tr_cower=TR_COWER_TICS;
}
/* Return before the original state machine: a survivor never executes attacks. */
int TR_Think(mobj_t *m) {
 thinker_t *th; int a;
 if(m->health<=0) return 0;
 if(m->tr_stun>0) { --m->tr_stun; m->momx=m->momy=0; return 1; }
 if(!m->tr_crew) return 0;
 m->target=NULL;
 if(!(leveltime&7)) for(th=thinkercap.next;th!=&thinkercap;th=th->next) {
  mobj_t *other;
  if(th->function.acp1!=(actionf_p1)P_MobjThinker) continue;
  other=(mobj_t*)th;
  if(other!=m && !other->player && !other->tr_crew && other->health>0
    && (other->flags&MF_COUNTKILL) && !TR_Human(other)
    && P_AproxDistance(other->x-m->x,other->y-m->y)<TR_FEAR_RANGE && P_CheckSight(m,other))
   m->tr_cower=TR_COWER_TICS;
 }
 if(m->tr_cower>0) { --m->tr_cower; m->frame=6; return 1; }
 if(!(leveltime&31)) m->angle=(angle_t)P_Random()<<24;
 a=m->angle>>ANGLETOFINESHIFT;
 if(!P_TryMove(m,m->x+finecosine[a],m->y+finesine[a])) m->angle+=ANG90;
 m->sprite=m->type==MT_SHOTGUY?SPR_SPOS:SPR_POSS;
 m->frame=(leveltime/8)&3;
 return 1;
}
static mobj_t *crosshair(player_t *p,fixed_t range) {
 P_AimLineAttack(p->mo,p->mo->angle,range);
 return linetarget && linetarget->health>0 && TR_Human(linetarget)
  && P_CheckSight(p->mo,linetarget)?linetarget:NULL;
}
static void corpses(player_t *p) {
 thinker_t *th; int index=0,tests=0,total=0;
 for(th=thinkercap.next;th!=&thinkercap;th=th->next) {
  mobj_t *m; int dead,doomnum;
  if(th->function.acp1!=(actionf_p1)P_MobjThinker) continue;
  m=(mobj_t*)th; ++total; if(index++<corpse_cursor || tests>=TR_TERROR_SCAN) continue;
  corpse_cursor=index; ++tests; doomnum=m->info->doomednum;
  dead=(m->flags&MF_CORPSE) || (doomnum>=18&&doomnum<=23) || doomnum==10 || doomnum==12 || doomnum==15 || (doomnum>=59&&doomnum<=63) || (doomnum>=73&&doomnum<=81);
  if(!dead || m->tr_seen || m->player) continue;
  if(P_AproxDistance(m->x-p->mo->x,m->y-p->mo->y)>TR_TERROR_RANGE || ((int32_t)(R_PointToAngle2(p->mo->x,p->mo->y,m->x,m->y)-p->mo->angle)>(int32_t)ANG45 || (int32_t)(R_PointToAngle2(p->mo->x,p->mo->y,m->x,m->y)-p->mo->angle)<-(int32_t)ANG45) || !P_CheckSight(p->mo,m)) continue;
  m->tr_seen=1;
  tr_terror=clamp(tr_terror+(m->tr_crew && m->tr_death_tic && leveltime-m->tr_death_tic<70?3:m->tr_death_tic && leveltime-m->tr_death_tic<70 && P_AproxDistance(m->x-p->mo->x,m->y-p->mo->y)<TR_TERROR_CLOSE?2:1),100);
  last_corpse=leveltime;
 }
 if(corpse_cursor>=total) corpse_cursor=0;
 if(leveltime-last_corpse>=TR_TERROR_DECAY) {if(tr_terror)--tr_terror;last_corpse=leveltime;}
}
const char *TR_TerrorBucket(void) {return tr_terror<25?"steady":tr_terror<50?"shaken":tr_terror<80?"terrified":"breaking";}
int TR_Hit(void) {return P_Random()<256-tr_terror*TR_HIT_LOSS/100;}
int TR_Damage(int damage) {return damage+(damage*tr_terror*TR_DAMAGE_EXTRA)/1000;}
int TR_Ammo(player_t *p,int amount) {tr_rounds+=amount;syncammo(p);p->message=amount==1?"+1 round":amount==2?"+2 rounds":amount==3?"+3 rounds":"+4 rounds";return 1;}
EMSCRIPTEN_KEEPALIVE int tremor_fear(void) {return tr_terror;}
void TR_PlayerThink(player_t *p) {
 mobj_t *m; int buttons=p->cmd.buttons2;
 if(buttons&64) tr_gore=(buttons>>4)&3; /* Recorded setting changes. */
 if(p->playerstate!=PST_LIVE) return;
 tr_pitch+=(signed char)p->cmd.lookfly; if(p->cmd.lookfly==127)tr_pitch=0; if(tr_pitch>64)tr_pitch=64;if(tr_pitch< -64)tr_pitch=-64;
 corpses(p); TR_StoryTick(p);
 if(kick) --kick;
 if(stun_cooldown) --stun_cooldown;
 syncammo(p);
 if(!tr_rounds && weaponinfo[p->readyweapon].ammo!=am_noammo) p->pendingweapon=wp_fist;
 m=crosshair(p,MISSILERANGE);
 if((buttons&TR_READ) && m) {
  if(m!=read_target) { read_target=m; read_tics=0; }
  if(++read_tics==TR_READ_TICS) { if(!m->tr_revealed) ++tr_reads; m->tr_revealed=1; if(m->tr_crew) TR_Radio(1); p->message=m->tr_crew?"crew":"possessed"; }
 } else { read_target=NULL; read_tics=0; }
 m=crosshair(p,MELEERANGE);
 if((buttons&TR_STUN) && !stun_cooldown) {
  stun_cooldown=TR_STUN_COOLDOWN;
  if(m) { m->tr_stun=TR_STUN_TICS; m->momx=m->momy=0; S_StartSound(p->mo,sfx_punch); }
 }
 if(!damaged && (buttons&TR_PURGE) && m && m->tr_stun>0 && !m->tr_crew && tr_charges>0) {
  if(purge_target!=m) { purge_target=m; purge_tics=0; }
  if(++purge_tics>=TR_PURGE_TICS) {
   TR_Radio(3); TR_QueueRadio("crew-ammo|Take these. Get out of here."); --tr_charges; ++tr_saved; TR_Ammo(p,3); m->tr_crew=1; m->tr_revealed=1; p->message="Take these. Get out of here. +3 rounds"; m->target=NULL;
   if(m->flags&MF_COUNTKILL) { m->flags &= ~MF_COUNTKILL; --totalkills; }
   purge_target=NULL; purge_tics=0;
  }
 } else { purge_target=NULL; purge_tics=0; }
 damaged=0;
}
int TR_CheckAmmo(player_t *p) {
 if(weaponinfo[p->readyweapon].ammo==am_noammo || tr_rounds>0) return 1;
 p->pendingweapon=wp_fist;
 P_SetPsprite(p,ps_weapon,weaponinfo[p->readyweapon].downstate); return 0;
}
void TR_SpendRound(player_t *p) { mobj_t *target=crosshair(p,MISSILERANGE); if(target && !target->tr_revealed) ++tr_fired_unread; if(tr_rounds>0) --tr_rounds; syncammo(p); TR_Shot(p); }
angle_t TR_Aim(void) { return (TR_Hit()?0:ANG45+((angle_t)P_Random()<<22)) + (tr_trauma?(angle_t)((P_Random()-P_Random())*tr_trauma*TR_AIM_UNIT):0); }
fixed_t TR_Sway(void) {
 fixed_t value=FixedMul(tr_trauma*FRACUNIT/3,finesine[(leveltime*311)&FINEMASK])+FixedMul(tr_terror*FRACUNIT/12,finesine[((leveltime-1)*37+(tr_fraction*37/FRACUNIT))&FINEMASK])+kick*FRACUNIT/3;
 if(tr_terror>60 && leveltime%211<2)value+=(leveltime&1?1:-1)*tr_terror*FRACUNIT/30;
 return screen_shake?value*tr_sway/100:0;
}
void TR_Impact(void) { kick=TR_IMPACT_TICS; }
void TR_Shot(player_t *p) { kick=TR_SHOT_KICK_TICS; p->extralight=2; }
int TR_Gib(mobj_t *s,mobj_t *t) {
 if(!s || !s->player) return 0;
 if(t->tr_melee_hit) return 1;
 return tr_gore==2 && t->tr_shotgun_hit
  && P_AproxDistance(t->x-s->x,t->y-s->y)<TR_CLOSE_RANGE && P_Random()<TR_SHOTGUN_GIB_THRESHOLD;
}
void TR_Kill(mobj_t *s,mobj_t *t) {
 int i,n,decoration; mobj_t *b;
 if(t->player || (!(t->flags&MF_COUNTKILL) && !t->tr_crew && t->type!=MT_SKULL)) return;
 if(s && s->player && s->player->health>0) {
  player_t *p=s->player;
  if(TR_Human(t)) { ++tr_kills_humans; if(t->tr_crew) ++tr_crew_killed; } else ++tr_kills_demons;
  if(TR_Human(t)) tr_trauma=clamp(tr_trauma+1,TR_MAX_TRAUMA);
  p->health=clamp(p->health+(TR_Human(t)?TR_HUMAN_HEAL:TR_DEMON_HEAL),TR_HEALTH_CAP); s->health=p->health;
  if(P_AproxDistance(t->x-s->x,t->y-s->y)<TR_CLOSE_RANGE) p->damagecount=TR_KILL_FLASH_TICS;
 }
 if(t->tr_crew) TR_Radio(2);
 t->tr_death_tic=leveltime;
 if(!t->tr_crew && P_Random()<TR_AMMO_DROP) { b=P_SpawnMobj(t->x,t->y,ONFLOORZ,MT_CLIP); b->flags|=MF_DROPPED; }
 if(tr_gore!=2) return;
 n=TR_BLOOD_MIN+P_Random()%TR_BLOOD_VARIATION;
 for(i=0;i<n;i++) {
  b=P_SpawnMobj(t->x,t->y,t->z+24*FRACUNIT,MT_BLOOD);
  b->momx=(P_Random()-128)*2048; b->momy=(P_Random()-128)*2048; b->momz=(2+P_Random()%5)*FRACUNIT;
 }
 /* Existing WAD decorations: pools of blood / brains (thing 79/80/81). */
 decoration=79+P_Random()%3;
 for(i=0;i<NUMMOBJTYPES;i++) if(mobjinfo[i].doomednum==decoration) {
  /* Episode-1 IWADs need not contain Doom-II decoration sprites. */
  state_t *state=&states[mobjinfo[i].spawnstate];
  if(sprites[state->sprite].numframes>(state->frame&FF_FRAMEMASK)) P_SpawnMobj(t->x,t->y,ONFLOORZ,i);
  break;
 }
}
/* A palette-index translation retains sector shading and uses the IWAD palette. */
byte *TR_RedMap(byte *map) {
 static byte red[256],out[64][256]; static byte *inputs[64]; static int ready,count; int i,j,slot;
 if(!ready) {
  byte *pal=W_CacheLumpName("PLAYPAL",PU_STATIC);
  for(i=0;i<256;i++) { int best=0,score=0x7fffffff; int r=pal[i*3],g=pal[i*3+1]/2,b=pal[i*3+2]/2;
   for(j=0;j<256;j++) { int d=(pal[j*3]-r)*(pal[j*3]-r)+(pal[j*3+1]-g)*(pal[j*3+1]-g)+(pal[j*3+2]-b)*(pal[j*3+2]-b); if(d<score) { score=d; best=j; } }
   red[i]=best;
  } W_ReleaseLumpName("PLAYPAL"); ready=1;
 }
 if(!map) return map;
 for(slot=0;slot<count;slot++) if(inputs[slot]==map) return out[slot];
 slot=count<64?count++:63; inputs[slot]=map;
 for(i=0;i<256;i++) out[slot][i]=red[map[i]];
 return out[slot];
}
EMSCRIPTEN_KEEPALIVE void tremor_set_gore(int v) { tr_gore=clamp(v,2); }
EMSCRIPTEN_KEEPALIVE void tremor_set_mouse_sensitivity(int v) { mouseSensitivity=clamp(v,30); }
EMSCRIPTEN_KEEPALIVE void tremor_set_volumes(int s,int m) { S_SetSfxVolume(clamp(s,15)*8); S_SetMusicVolume(clamp(m,15)*8); }
EMSCRIPTEN_KEEPALIVE void tremor_bind_key(int a,int k) {
 int *keys[TR_ACTIONS]={&key_up,&key_down,&key_strafeleft,&key_straferight,&key_left,&key_right,
 &key_fire,&key_use,&key_speed,&tr_keys[0],&tr_keys[1],&tr_keys[2],&key_weapon1,&key_weapon2,&key_weapon3,
 &key_weapon4,&key_weapon5,&key_weapon6,&key_weapon7,&key_map_toggle,&key_menu_activate};
 if(a>=0 && a<TR_ACTIONS && k>=0 && k<256) *keys[a]=k;
}

/* Insert original CREW pictures into the IWAD sprite namespace before caches
   initialize. No game pictures are copied into the distributed PWAD. */
void TR_MergeCrewSprites(unsigned int first) {
 unsigned int i,j,end=0; lumpinfo_t crew[2]; int found=0;
 /* TREMOR: replace matching IWAD sprite records before adding CREW frames. */
 for(i=first;i<numlumps;i++) for(j=0;j<first;j++) if(!strncmp(lumpinfo[i].name,lumpinfo[j].name,8) && strncmp(lumpinfo[i].name,"S_",2)) {lumpinfo[j]=lumpinfo[i];break;}
 for(i=0;i<first;i++) if(!strncmp(lumpinfo[i].name,"S_END",8)) end=i;
 for(i=first;i<numlumps;i++) if(!strncmp(lumpinfo[i].name,"CREWA0",8) || !strncmp(lumpinfo[i].name,"CREWB0",8)) {
  if(found<2) crew[found++]=lumpinfo[i];
 }
 if(!end || found!=2) return;
 memmove(lumpinfo+end+2,lumpinfo+end,(first-end)*sizeof(*lumpinfo));
 lumpinfo[end]=crew[0]; lumpinfo[end+1]=crew[1]; numlumps=first+2;
 for(i=0;i<numlumps;i++) { lumpinfo[i].next=NULL; if(lumpinfo[i].cache) Z_ChangeUser(lumpinfo[i].cache,&lumpinfo[i].cache); }
}

void TR_Noise(mobj_t *source) {
 thinker_t *th;
 for(th=thinkercap.next;th!=&thinkercap;th=th->next) if(th->function.acp1==(actionf_p1)P_MobjThinker) {
  mobj_t *m=(mobj_t*)th;
  if(m->tr_crew && m->health>0 && P_AproxDistance(m->x-source->x,m->y-source->y)<TR_GUN_FEAR_RANGE && P_CheckSight(source,m)) m->tr_cower=TR_COWER_TICS;
 }
}

EMSCRIPTEN_KEEPALIVE void tremor_set_screen_shake(int v) { screen_shake=!!v; }

EM_JS(void, TR_FlushSaves, (), { Module.flushSaves?.(); });

EM_JS(void, TR_SettingsReady, (), { Module.onSettingsReady?.(); });

/* Original map-derived objective and episode radio state. */
#include <stdio.h>
int tr_story_clock,tr_radio_last=-TR_RADIO_COOLDOWN,tr_radio_bits;
#define story_clock tr_story_clock
#define radio_last tr_radio_last
#define radio_bits tr_radio_bits
int tr_radio_pending;
#define radio_pending tr_radio_pending
static char radio_queue[16][512];static int radio_head,radio_tail;
char tr_radio_history[16384]; unsigned int tr_briefing_bits;
#define radio_history tr_radio_history
#define briefing_bits tr_briefing_bits
void TR_QueueRadio(const char *line) {size_t used=strlen(radio_history);if(used+strlen(line)+2<sizeof(radio_history)){if(used)strcat(radio_history,"\n");strcat(radio_history,line);}if(radio_tail-radio_head>=16)++radio_head;snprintf(radio_queue[radio_tail++%16],512,"%s",line);}
EMSCRIPTEN_KEEPALIVE const char *tremor_radio_pop(void) {return radio_head<radio_tail?radio_queue[radio_head++%16]:"";}
char tr_radio_log[512];
#define radio_log tr_radio_log
static char objective[80],story_json[1024];
static fixed_t objective_x,objective_y;
static const char *radio_ids[]={"","crew-reveal","crew-death","crew-saved","breaking","static-1","static-2","static-3","static-4","static-5","static-6","static-7"};
static const char *radio_text[]={"","That one's still human. Look before you shoot.","I heard that. I'll keep the channel open.","They're breathing. Thank you for waiting.","Listen to my voice. There is still a way out.","Control to anyone. Is that someone breathing on the line?","There is someone outside this room. They know my name.","Signal dropping. I can still hear you.","Please do not answer the other channel.","The banging stopped. That is worse.","I thought I heard the lift. It was above me.","Keep the receiver close. The walls carry sound here."};
void TR_Radio(int beat) {
 if(beat<0) {radio_head=radio_tail=radio_pending=0;story_clock=radio_bits=0;radio_last=-TR_RADIO_COOLDOWN;radio_log[0]=0;radio_history[0]=0;briefing_bits=0;return;}
 if(beat<1 || beat>11 || (radio_bits&(1<<beat))) return;
 radio_pending|=1<<beat;
 if(story_clock-radio_last<TR_RADIO_COOLDOWN)return;
 radio_pending&=~(1<<beat);
 radio_bits|=1<<beat;radio_last=story_clock;
 snprintf(radio_log,sizeof(radio_log),"%s|%s",radio_ids[beat],radio_text[beat]);TR_QueueRadio(radio_log);
}
const char *TR_RadioLog(void){return radio_history;}
const char *TR_Objective(void){return objective;}
int TR_KeyColor(int special) {
 switch(special) {case 26:case 32:case 99:case 133:return 0;case 27:case 34:case 136:case 137:return 1;case 28:case 33:case 134:case 135:return 2;}return -1;
}
static int exit_special(int s){return s==11 || s==51 || s==52 || s==124;}
void TR_StoryTick(player_t *p) {
 const char *colors[]={"blue","yellow","red"};int i,c;thinker_t *th;
 ++story_clock;if(story_clock%7350==0)TR_Radio(5+(story_clock/7350-1)%7);for(int beat=1;beat<=11;beat++)if(radio_pending&(1<<beat))TR_Radio(beat);if(tr_terror>=80) TR_Radio(4);
 /* Prefer the ordinary exit; optional locked rooms must not become mandatory. */
 if(leveltime%35 && objective[0])return;
 strcpy(objective,"Reach the exit");
 line_t *exitline=NULL;
 for(i=0;i<numlines;i++)if(lines[i].special==11||lines[i].special==52){exitline=&lines[i];break;}
 if(!exitline)for(i=0;i<numlines;i++)if(exit_special(lines[i].special)){exitline=&lines[i];break;}
 if(!exitline)return;
 objective_x=exitline->v1->x+exitline->dx/2;objective_y=exitline->v1->y+exitline->dy/2;
 /* The quest planner chooses required locks, not navigation coordinates. Its
    only output is the same objective and bearing shown by the human TAB HUD. */
 if(numsectors>4096)return;
 static int distance[4096],parent[4096],doorline[4096],done[4096];
 for(i=0;i<numsectors;i++){distance[i]=100000000;parent[i]=-1;doorline[i]=-1;done[i]=0;}
 for(i=0;i<numlines;i++){line_t *l=&lines[i];if(TR_KeyColor(l->special)<0)continue;
  sector_t *door=l->backsector;if(door&&door->ceilingheight<=door->floorheight+56*FRACUNIT)doorline[door-sectors]=i;
 }
 int start=p->mo->subsector->sector-sectors,finish=exitline->frontsector-sectors;
 distance[start]=0;
 for(int pass=0;pass<numsectors;pass++){
  int at=-1;for(i=0;i<numsectors;i++)if(!done[i]&&(at<0||distance[i]<distance[at]))at=i;
  if(at<0||distance[at]>=100000000)break;done[at]=1;if(at==finish)break;
  for(i=0;i<numlines;i++){line_t *l=&lines[i];if(!l->frontsector||!l->backsector)continue;
   int f=l->frontsector-sectors,b=l->backsector-sectors,to=f==at?b:b==at?f:-1;if(to<0||to==at)continue;
   if((l->flags&ML_BLOCKING)&&!l->special)continue;
   int cost=1,d=doorline[to];if(d>=0){int key=TR_KeyColor(lines[d].special);if(!p->cards[key]&&!p->cards[key+3])cost+=1000;}
   if(distance[at]+cost<distance[to]){distance[to]=distance[at]+cost;parent[to]=at;}
  }
 }
 int required=-1;for(i=finish;i>=0&&i!=start;i=parent[i])if(doorline[i]>=0)required=doorline[i];
 if(required<0)return;
 line_t *l=&lines[required];c=TR_KeyColor(l->special);
 if(p->cards[c]||p->cards[c+3]){snprintf(objective,sizeof(objective),"Open the %s door",colors[c]);objective_x=l->v1->x+l->dx/2;objective_y=l->v1->y+l->dy/2;return;}
 for(th=thinkercap.next;th!=&thinkercap;th=th->next)if(th->function.acp1==(actionf_p1)P_MobjThinker){
  mobj_t *m=(mobj_t*)th;int color=m->sprite==SPR_BKEY||m->sprite==SPR_BSKU?0:m->sprite==SPR_YKEY||m->sprite==SPR_YSKU?1:m->sprite==SPR_RKEY||m->sprite==SPR_RSKU?2:-1;
  if(color==c&&(m->flags&MF_SPECIAL)){snprintf(objective,sizeof(objective),"Find the %s keycard",colors[c]);objective_x=m->x;objective_y=m->y;return;}
 }

}
static const char *briefings[]={"This is Halloran, UAC comms. I locked myself in control when the hangar crew stopped answering. Find the way out; I will stay on this frequency.","You are inside the containment perimeter. They sealed those doors with people still working behind them. Look for a card beside the locked routes.","The treatment plant is running without its operators. Something is moving against the current. Follow the access doors toward the exit.","That station used to report every fault to me. Now every light is green and nobody answers. Find the next passage out.","This is the laboratory sector. We kept the samples cold; that did not keep them quiet. The secured route should take you onward.","The central complex is ahead. I can hear its alarm through the wall of this room. Find the access card and keep moving.","You have reached the computing wing. The terminals are still accepting names from empty desks. Look for the route beyond the locks.","The last facility is beyond this threshold. I cannot promise what waits there. Get to the exit while this channel holds.","This annex was missing from the evacuation plan. There are voices on its local channel, all using the same name. Find a route back out."};
void TR_StoryStart(void) {
 radio_last=story_clock; /* Leave space for the briefing before rare story beats. */
 snprintf(radio_log,sizeof(radio_log),"e1m%d|%s",gamemap,briefings[(gamemap-1)%9]);
 if(!(briefing_bits&(1u<<gamemap))){briefing_bits|=1u<<gamemap;TR_QueueRadio(radio_log);}
 objective[0]=0;TR_StoryTick(&players[consoleplayer]);
}
int TR_ObjectiveBearing(player_t *p) {return (int)((double)(int32_t)(R_PointToAngle2(p->mo->x,p->mo->y,objective_x,objective_y)-p->mo->angle)*360.0/4294967296.0);}
const char *TR_ObjectiveDistance(player_t *p) {int d=P_AproxDistance(objective_x-p->mo->x,objective_y-p->mo->y)/FRACUNIT;return d<128?"near":d<512?"nearby":"far";}
EMSCRIPTEN_KEEPALIVE const char *tremor_story(void) {
 player_t *p=&players[consoleplayer];snprintf(story_json,sizeof(story_json),"%s|%d|%s|%s",objective,TR_ObjectiveBearing(p),TR_ObjectiveDistance(p),radio_log);return story_json;
}

EMSCRIPTEN_KEEPALIVE void tremor_look(int delta) {look_pending+=delta;if(look_pending>126)look_pending=126;if(look_pending< -126)look_pending=-126;}
EMSCRIPTEN_KEEPALIVE void tremor_center_view(void) {look_pending=127;}
int TR_LookCommand(void) {int v=look_pending;look_pending=0;return v;}
fixed_t TR_PitchSlope(void) {if(!tr_pitch)return 0;return finetangent[(FINEANGLES/4+(tr_pitch*FINEANGLES/720))&FINEMASK];}
EMSCRIPTEN_KEEPALIVE void tremor_comfort(int sway,int autoaim) {tr_sway=clamp(sway,100);tr_autoaim=!!autoaim;}

#include "i_video.h"
fixed_t tr_fraction=FRACUNIT;
static int preview_phase=-1;
fixed_t TR_Interpolate(fixed_t old,fixed_t current) {if(abs(current-old)>128*FRACUNIT)return current;return old+FixedMul(current-old,tr_fraction);}
void TR_RenderClock(void) {
#ifndef TR_HEADLESS
 static int tic=-1;static double start;double now=emscripten_get_now();
 if(tic!=leveltime){tic=leveltime;start=now;}tr_fraction=clamp((int)((now-start)*35*FRACUNIT/1000),FRACUNIT);
#endif
}
void TR_PreviewView(void) {
 if(preview_phase<0) return;
 fixed_t tx=objective_x-96*FRACUNIT,ty=objective_y-96*FRACUNIT;
 subsector_t *sub=R_PointInSubsector(tx,ty);
 fixed_t tz=sub->sector->floorheight+41*FRACUNIT;
 fixed_t f=preview_phase*FRACUNIT/1000;
 viewx+=FixedMul(tx-viewx,f);viewy+=FixedMul(ty-viewy,f);viewz+=FixedMul(tz-viewz,f);
 viewangle+=(angle_t)((int64_t)(int32_t)(R_PointToAngle2(viewx,viewy,objective_x,objective_y)-viewangle)*f/FRACUNIT);
}
EMSCRIPTEN_KEEPALIVE void tremor_preview(int phase) {
 preview_phase=phase;
#ifndef TR_HEADLESS
 if(phase>=0){R_RenderPlayerView(&players[consoleplayer]);I_FinishUpdate();}
#endif
}

int TR_Light(sector_t *sector) {
#ifdef TR_VANILLA_LIGHT
 return sector->lightlevel;
#elif defined(TR_PREVIOUS_LIGHT)
 unsigned int id=(unsigned int)(sector-sectors);return sector->lightlevel-16-((id%8==0&&sector->lightlevel>96&&(((unsigned int)leveltime*1664525u+id*1013904223u)>>24)<40)?32:0);
#else
 unsigned int id=(unsigned int)(sector-sectors);return sector->lightlevel-16-((sector->lightlevel>96 && (((unsigned int)leveltime*1664525u+id*1013904223u)>>24)<40)?32:0);
#endif
}
fixed_t TR_ArmY(void) {return tr_sway*(FixedMul(tr_terror*FRACUNIT/14,finesine[((leveltime-1)*74+(tr_fraction*74/FRACUNIT))&FINEMASK])+(tr_terror>50?(M_Random()-128)*tr_terror*8:0))/100;}
static double render_start,render_ms;
void TR_ProfileStart(void) {render_start=emscripten_get_now();}
void TR_ProfileEnd(void) {render_ms=emscripten_get_now()-render_start;}
EMSCRIPTEN_KEEPALIVE double tremor_render_ms(void){return render_ms;}

static fixed_t arm_turn;
EMSCRIPTEN_KEEPALIVE void tremor_arm_turn(int dx) {arm_turn=clamp(dx+128,256)*FRACUNIT/8-16*FRACUNIT;}
fixed_t TR_ArmX(void) {arm_turn=arm_turn*7/8;return TR_Sway()+tr_sway*arm_turn/100;}

int TR_PreviewActive(void){return preview_phase>=0;}

EMSCRIPTEN_KEEPALIVE int tremor_pressure(void) {int n=0;thinker_t *th;player_t *p=&players[consoleplayer];for(th=thinkercap.next;th!=&thinkercap;th=th->next)if(th->function.acp1==(actionf_p1)P_MobjThinker){mobj_t *m=(mobj_t*)th;if(m->health>0 && !m->tr_crew && (m->flags&MF_COUNTKILL) && m->target==p->mo && P_AproxDistance(m->x-p->mo->x,m->y-p->mo->y)<512*FRACUNIT)++n;}return n>5?100:n*20;}

EMSCRIPTEN_KEEPALIVE int tremor_tic(void){return gametic;}

void TR_ClearRadioQueue(void){radio_head=radio_tail=0;}

/* Activation legend shared by the human map and public observation. */
int TR_LineMarker(int s){
 switch(s){case 1:case 26:case 27:case 28:case 31:case 32:case 33:case 34:case 117:case 118:return 'D';
 case 7:case 9:case 11:case 14:case 15:case 18:case 20:case 21:case 23:case 29:case 41:case 71:case 49:case 50:case 51:case 55:case 101:case 102:case 103:case 111:case 112:case 113:case 122:case 127:case 131:case 133:case 135:case 137:case 140:case 42:case 43:case 45:case 60:case 61:case 62:case 63:case 64:case 66:case 67:case 65:case 68:case 69:case 70:case 114:case 115:case 116:case 123:case 132:case 99:case 134:case 136:case 138:case 139:return 'S';default:return s?'T':0;}
}

void TR_BrowserMouse(int dx){int64_t scaled=-(int64_t)dx*(mouseSensitivity+5)*8/10;int turn=scaled>32760?32760:scaled< -32760?-32760:(int)scaled;mouse_unbuilt+=turn;mouse_pending+=turn;}
int TR_BrowserMouseCommand(void){int turn=mouse_unbuilt;if(turn>32767)turn=32767;if(turn< -32767)turn=-32767;mouse_unbuilt-=turn;return turn;}
void TR_BrowserMouseApplied(int turn){mouse_pending-=turn;mouse_last=turn;}
angle_t TR_BrowserMouseView(void){return (angle_t)((int64_t)mouse_pending*65536+(int64_t)mouse_last*65536*(FRACUNIT-tr_fraction)/FRACUNIT);}
EMSCRIPTEN_KEEPALIVE const char *tremor_radio_history(void){return tr_radio_history;}

int TR_DoorOpen(line_t *line){
 if(!line->frontsector||!line->backsector)return 0;
 fixed_t floor=line->frontsector->floorheight>line->backsector->floorheight?line->frontsector->floorheight:line->backsector->floorheight;
 fixed_t ceiling=line->frontsector->ceilingheight<line->backsector->ceilingheight?line->frontsector->ceilingheight:line->backsector->ceilingheight;
 return ceiling-floor>=56*FRACUNIT;
}
