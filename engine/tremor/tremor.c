/* Original Tremor implementation. GPL-2.0-or-later. */
#include "tremor.h"
#include "doomstat.h"
#include "m_random.h"
#include "m_controls.h"
#include "s_sound.h"
#include "sounds.h"
#include "w_wad.h"
#include "z_zone.h"
#include <emscripten.h>
#include <stdlib.h>
#include <string.h>

int tr_keys[3]={'r','f','q'};
int tr_trauma,tr_rounds,tr_charges,tr_saved,tr_gore=2;
static mobj_t *read_target,*purge_target;
static int read_tics,purge_tics,stun_cooldown,kick,damaged;
extern int mouseSensitivity;
void P_SetPsprite(player_t *, int, statenum_t);
EM_JS(int, tr_has_intro, (), { return Module.onIntro?1:0; });
EM_ASYNC_JS(void, tr_intro, (), { if(Module.onIntro) await Module.onIntro(); });
static int clamp(int v,int max) { return v<0?0:v>max?max:v; }
int TR_Human(mobj_t *m) { return m && (m->type==MT_POSSESSED || m->type==MT_SHOTGUY || m->type==MT_CHAINGUY); }
static void syncammo(player_t *p) { int i; for(i=0;i<NUMAMMO;i++) p->ammo[i]=tr_rounds; }
void TR_NewGame(void) { tr_trauma=0; }
void TR_MapSpawn(mobj_t *m) {
 if ((m->type==MT_POSSESSED || m->type==MT_SHOTGUY) && P_Random()<TR_CREW_THRESHOLD) {
  m->tr_crew=1; m->flags &= ~MF_COUNTKILL;
 }
}
void TR_LevelStart(void) {
 int i;
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
void TR_PlayerThink(player_t *p) {
 mobj_t *m; int buttons=p->cmd.buttons2;
 if(buttons&64) tr_gore=(buttons>>4)&3; /* Recorded setting changes. */
 if(p->playerstate!=PST_LIVE) return;
 if(kick) --kick;
 if(stun_cooldown) --stun_cooldown;
 syncammo(p);
 if(!tr_rounds && weaponinfo[p->readyweapon].ammo!=am_noammo) p->pendingweapon=wp_fist;
 m=crosshair(p,MISSILERANGE);
 if((buttons&TR_READ) && m) {
  if(m!=read_target) { read_target=m; read_tics=0; }
  if(++read_tics==TR_READ_TICS) { m->tr_revealed=1; p->message=m->tr_crew?"crew":"possessed"; }
 } else { read_target=NULL; read_tics=0; }
 m=crosshair(p,MELEERANGE);
 if((buttons&TR_STUN) && !stun_cooldown) {
  stun_cooldown=TR_STUN_COOLDOWN;
  if(m) { m->tr_stun=TR_STUN_TICS; m->momx=m->momy=0; S_StartSound(p->mo,sfx_punch); }
 }
 if(!damaged && (buttons&TR_PURGE) && m && m->tr_stun>0 && !m->tr_crew && tr_charges>0) {
  if(purge_target!=m) { purge_target=m; purge_tics=0; }
  if(++purge_tics>=TR_PURGE_TICS) {
   --tr_charges; ++tr_saved; m->tr_crew=1; m->target=NULL;
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
void TR_SpendRound(player_t *p) { if(tr_rounds>0) --tr_rounds; syncammo(p); TR_Shot(p); }
angle_t TR_Aim(void) { return tr_trauma?(angle_t)((P_Random()-P_Random())*tr_trauma*TR_AIM_UNIT):0; }
fixed_t TR_Sway(void) { return FixedMul(tr_trauma*FRACUNIT/3,finesine[(leveltime*311)&FINEMASK])+kick*FRACUNIT/3; }
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
  if(TR_Human(t)) tr_trauma=clamp(tr_trauma+1,TR_MAX_TRAUMA);
  p->health=clamp(p->health+(TR_Human(t)?TR_HUMAN_HEAL:TR_DEMON_HEAL),TR_HEALTH_CAP); s->health=p->health;
  if(P_AproxDistance(t->x-s->x,t->y-s->y)<TR_CLOSE_RANGE) p->damagecount=TR_KILL_FLASH_TICS;
 }
 if(tr_gore!=2) return;
 n=TR_BLOOD_MIN+P_Random()%TR_BLOOD_VARIATION;
 for(i=0;i<n;i++) {
  b=P_SpawnMobj(t->x,t->y,t->z+24*FRACUNIT,MT_BLOOD);
  b->momx=(P_Random()-128)*2048; b->momy=(P_Random()-128)*2048; b->momz=(2+P_Random()%5)*FRACUNIT;
 }
 /* Existing WAD decorations: pools of blood / brains (thing 79/80/81). */
 decoration=79+P_Random()%3;
 for(i=0;i<NUMMOBJTYPES;i++) if(mobjinfo[i].doomednum==decoration) {
  P_SpawnMobj(t->x,t->y,ONFLOORZ,i); break;
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
 unsigned int i,end=0; lumpinfo_t crew[2]; int found=0;
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
