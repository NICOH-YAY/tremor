/* Headless checks against the actual compiled engine and Tremor hooks. GPL-2.0+. */
#include "tremor.h"
#include "doomstat.h"
#include "m_random.h"
#include "p_inter.h"
#include "p_saveg.h"
#include <emscripten.h>
#include <stdio.h>
#include <string.h>
static int checks,failures;
#define CHECK(x) do { ++checks; if(!(x)) { ++failures; printf("FAIL %s:%d %s\n",__FILE__,__LINE__,#x); } } while(0)
static mobj_t *human(player_t *p,int crew) {
 mobj_t *m=P_SpawnMobj(p->mo->x+24*FRACUNIT,p->mo->y,ONFLOORZ,MT_POSSESSED);
 m->tr_crew=crew; m->tr_stun=0; return m;
}
EMSCRIPTEN_KEEPALIVE int tremor_test(void) {
 player_t *p=&players[0]; thinker_t *th; mobj_t *m,*d,*player_mo; int i,health,n; angle_t aim[8];
 checks=failures=0;
 /* Initial budget uses the map's real post-classification kill total. */
 CHECK(tr_rounds==totalkills+1); CHECK(tr_charges==2);
 n=0;
 for(th=thinkercap.next;th!=&thinkercap;th=th->next) if(th->function.acp1==(actionf_p1)P_MobjThinker) {
  m=(mobj_t*)th; if(m->flags&MF_COUNTKILL) ++n;
  if(m->tr_crew) CHECK(!(m->flags&MF_COUNTKILL));
 }
 CHECK(n==totalkills);
 health=p->health; m=human(p,1);
 P_DamageMobj(p->mo,m,m,1000); CHECK(p->health==health);
 for(i=0;i<100;i++) CHECK(TR_Think(m)==1);
 CHECK(m->target==NULL);
 n=tr_rounds;
 for(i=0;i<NUMAMMO;i++) { CHECK(P_GiveAmmo(p,i,5)); CHECK(p->ammo[i]==n+4); n+=4; }
 p->weaponowned[wp_shotgun]=0; CHECK(P_GiveWeapon(p,wp_shotgun,0)); CHECK(p->weaponowned[wp_shotgun]); CHECK(tr_rounds==n);
 p->readyweapon=wp_pistol; TR_SpendRound(p); CHECK(tr_rounds==n-1);
 p->readyweapon=wp_bfg; TR_SpendRound(p); CHECK(tr_rounds==n-2);
 for(i=0;i<NUMAMMO;i++) CHECK(p->ammo[i]==tr_rounds);
 tr_rounds=0; CHECK(!TR_CheckAmmo(p)); CHECK(p->pendingweapon==wp_fist);
 p->readyweapon=wp_fist; CHECK(TR_CheckAmmo(p));
 p->health=p->mo->health=95; tr_trauma=0; tr_gore=0;
 TR_Kill(p->mo,m); CHECK(p->health==100); CHECK(tr_trauma==1);
 m->tr_crew=0; TR_Kill(p->mo,m); CHECK(tr_trauma==2);
 d=P_SpawnMobj(p->mo->x,p->mo->y,ONFLOORZ,MT_TROOP);
 p->health=p->mo->health=40; TR_Kill(p->mo,d); CHECK(p->health==50); CHECK(tr_trauma==2);
 p->health=p->mo->health=40; TR_Kill(p->mo,m); CHECK(p->health==55); CHECK(tr_trauma==3);
 for(i=0;i<10;i++) TR_Kill(p->mo,m); CHECK(tr_trauma==TR_MAX_TRAUMA);
 TR_Kill(d,m); CHECK(tr_trauma==TR_MAX_TRAUMA);
 /* Clear nearby actors so the actual Doom aim tracer selects our fixture. */
 for(th=thinkercap.next;th!=&thinkercap;th=th->next) if(th->function.acp1==(actionf_p1)P_MobjThinker) {
  mobj_t *a=(mobj_t*)th; if(!a->player) a->flags &= ~MF_SHOOTABLE;
 }
 p->mo->angle=0; p->playerstate=PST_LIVE;
 m=human(p,0); p->cmd.buttons2=TR_STUN; TR_PlayerThink(p); CHECK(m->tr_stun==TR_STUN_TICS);
 n=m->tr_stun; CHECK(TR_Think(m)==1); CHECK(m->tr_stun==n-1);
 /* Reset level transient cooldown; identical action and duration on crew. */
 TR_LevelStart(); m->flags &= ~MF_SHOOTABLE; d=human(p,1);
 p->cmd.buttons2=TR_STUN; TR_PlayerThink(p); CHECK(d->tr_stun==TR_STUN_TICS);
 CHECK(TR_Think(d)==1); CHECK(d->tr_stun==n-1);
 d->flags &= ~MF_SHOOTABLE; m->flags |= MF_SHOOTABLE; m->tr_stun=TR_STUN_TICS;
 tr_charges=2; tr_saved=0; p->cmd.buttons2=TR_PURGE; n=tr_rounds;
 for(i=0;i<TR_PURGE_TICS-1;i++) TR_PlayerThink(p);
 CHECK(!m->tr_crew); CHECK(tr_charges==2);
 TR_PlayerThink(p); CHECK(m->tr_crew); CHECK(tr_charges==1); CHECK(tr_saved==1); CHECK(tr_rounds==n+3); CHECK(!(m->flags&MF_COUNTKILL));
 m->tr_crew=0; m->tr_stun=70;
 for(i=0;i<20;i++) TR_PlayerThink(p);
 TR_Damaged(p->mo); TR_PlayerThink(p);
 for(i=0;i<20;i++) TR_PlayerThink(p);
 CHECK(!m->tr_crew); CHECK(tr_charges==1);
 p->cmd.buttons2=0; TR_PlayerThink(p); p->cmd.buttons2=TR_READ;
 for(i=0;i<35;i++) TR_PlayerThink(p);
 CHECK(m->tr_revealed); CHECK(!strcmp(p->message,"possessed"));
 tr_terror=0; tr_trauma=0; CHECK(TR_Aim()==0);
 for(i=0;i<256;i++) CHECK(TR_Hit());
 tr_terror=100; n=0; M_ClearRandom(); for(i=0;i<256;i++) n+=TR_Hit(); CHECK(n>=70 && n<=85); CHECK(TR_Damage(100)==160); tr_terror=0; CHECK(TR_Damage(100)==100); tr_pitch=0;CHECK(TR_PitchSlope()==0);
 tremor_set_gore(99); CHECK(tr_gore==2); tremor_set_gore(-1); CHECK(tr_gore==0);
 /* Real damage/death hook: fists gib, human adds trauma, delayed projectile
    damage does not become a fist kill just because the player switched. */
 m=human(p,0); p->readyweapon=wp_fist; tr_trauma=0; p->health=p->mo->health=40;
 P_DamageMobj(m,p->mo,p->mo,1000);
 CHECK(m->health<0); CHECK(m->state==&states[m->info->xdeathstate]);
 CHECK(tr_trauma==1); CHECK(p->health==55);
 m=human(p,0); m->tr_melee_hit=0; m->tr_shotgun_hit=0; CHECK(!TR_Gib(p->mo,m));
 /* Same gameplay RNG seed produces the same aim offsets. */
 tr_trauma=6; M_ClearRandom(); for(i=0;i<8;i++) aim[i]=TR_Aim();
 M_ClearRandom(); for(i=0;i<8;i++) CHECK(aim[i]==TR_Aim());
 /* Global resources survive the versioned save player archive. */
 player_mo=p->mo; tr_rounds=17; tr_charges=1; tr_saved=3;
 save_stream=tmpfile(); CHECK(save_stream!=NULL);
 if(save_stream) {
  P_ArchivePlayers(); rewind(save_stream);
  tr_trauma=tr_rounds=tr_charges=tr_saved=0;
  P_UnArchivePlayers(); fclose(save_stream); save_stream=NULL; p->mo=player_mo;
  CHECK(tr_trauma==6); CHECK(tr_rounds==17); CHECK(tr_charges==1); CHECK(tr_saved==3);
 }
 /* New exposure is directional and counted once, including map decorations. */
 for(th=thinkercap.next;th!=&thinkercap;th=th->next)if(th->function.acp1==(actionf_p1)P_MobjThinker)((mobj_t*)th)->tr_seen=1;
 tr_terror=0; p->cmd.buttons2=0;p->mo->angle=0;
 m=P_SpawnMobj(p->mo->x+24*FRACUNIT,p->mo->y,ONFLOORZ,MT_TROOP);m->health=0;m->flags|=MF_CORPSE;
 for(i=0;i<1000;i++)TR_PlayerThink(p);CHECK(tr_terror==1);CHECK(m->tr_seen);
 for(i=0;i<1000;i++)TR_PlayerThink(p);CHECK(tr_terror==1);
 d=P_SpawnMobj(p->mo->x-24*FRACUNIT,p->mo->y,ONFLOORZ,MT_TROOP);d->health=0;d->flags|=MF_CORPSE;
 for(i=0;i<1000;i++)TR_PlayerThink(p);CHECK(!d->tr_seen);CHECK(tr_terror==1);
 p->mo->angle=ANG180;for(i=0;i<1000;i++)TR_PlayerThink(p);CHECK(d->tr_seen);CHECK(tr_terror==2);
 TR_LevelStart();CHECK(tr_terror==1);CHECK(strlen(TR_Objective())>0);
 for(i=0;i<numlines;i++)if(lines[i].special==26||lines[i].special==27||lines[i].special==28||lines[i].special==32||lines[i].special==33||lines[i].special==34)lines[i].special=0;
 TR_StoryTick(p);CHECK(!strcmp(TR_Objective(),"Reach the exit"));
 TR_Radio(-1);TR_Radio(1);CHECK(strstr(TR_RadioLog(),"crew-reveal|")!=NULL);
 TR_Radio(2);CHECK(strstr(TR_RadioLog(),"crew-reveal|")!=NULL);
 tr_story_clock+=3150;TR_StoryTick(p);CHECK(strstr(TR_RadioLog(),"crew-death|")!=NULL);
 tr_story_clock+=3150;TR_Radio(1);CHECK(strstr(TR_RadioLog(),"crew-death|")!=NULL);
 /* Actual map thinning, not a second implementation of the probability. */
 for(i=0;i<256;i++)P_SpawnMobj(p->mo->x+1024*FRACUNIT,p->mo->y,ONFLOORZ,MT_CLIP);
 TR_LevelStart();n=0;for(th=thinkercap.next;th!=&thinkercap;th=th->next)if(th->function.acp1==(actionf_p1)P_MobjThinker){m=(mobj_t*)th;if(m->type==MT_CLIP && !(m->flags&MF_DROPPED))++n;}
 CHECK(n>=48 && n<=80);
 /* Actual death hook drops one-round clips with the rare configured rate. */
 tr_gore=0;n=0;
 for(i=0;i<512;i++) {m=P_SpawnMobj(p->mo->x+512*FRACUNIT,p->mo->y,ONFLOORZ,MT_TROOP);TR_Kill(p->mo,m);}
 for(th=thinkercap.next;th!=&thinkercap;th=th->next)if(th->function.acp1==(actionf_p1)P_MobjThinker){m=(mobj_t*)th;if(m->type==MT_CLIP && (m->flags&MF_DROPPED))++n;}
 CHECK(n>=40 && n<=90);
 printf("Tremor engine: %d checks, %d failures\n",checks,failures);
 return failures;
}
