/* Original Tremor rules, GPL-2.0-or-later. All time values use Doom's 35 Hz. */
#ifndef TREMOR_H
#define TREMOR_H
#include "p_local.h"
#define TR_CREW_THRESHOLD 90 /* P_Random byte <90: 35.16% of POSS/SPOS. */
#define TR_READ_TICS 35 /* Continuous crosshair identification. */
#define TR_STUN_TICS 70 /* Same freeze for either human identity. */
#define TR_STUN_COOLDOWN 35 /* Prevent indefinite stun by holding F. */
#define TR_PURGE_TICS 35 /* Uninterrupted close contact. */
#define TR_PURGE_CHARGES 2 /* Reset each level. */
#define TR_MAX_TRAUMA 6 /* Episode lifetime; never displayed. */
#define TR_HUMAN_HEAL 15
#define TR_DEMON_HEAL 10
#define TR_HEALTH_CAP 100
#define TR_MELEE_MULTIPLIER 10 /* Berserk-strength fists without a powerup. */
#define TR_SHOTGUN_GIB_THRESHOLD 192 /* 75% at close range in hyper mode. */
#define TR_IMPACT_TICS 6 /* Render-only melee shake duration. */
#define TR_SHOT_KICK_TICS 3 /* Render-only firearm kick duration. */
#define TR_KILL_FLASH_TICS 8 /* Near kill red flash; not actual damage. */
#define TR_AIM_UNIT 16384 /* Binary angle units per random-byte delta / trauma. */
#define TR_CLOSE_RANGE (128*FRACUNIT) /* Kill flash / shotgun gib range. */
#define TR_FEAR_RANGE (192*FRACUNIT) /* Visible demons cause cowering. */
#define TR_GUN_FEAR_RANGE (512*FRACUNIT) /* Nearby gunfire makes crew cower. */
#define TR_COWER_TICS 35
#define TR_BLOOD_MIN 8
#define TR_BLOOD_VARIATION 9 /* Inclusive burst range 8..16. */
#define TR_READ 1
#define TR_STUN 2
#define TR_PURGE 4
enum { TR_FORWARD, TR_BACK, TR_LEFT, TR_RIGHT, TR_TURNLEFT, TR_TURNRIGHT,
 TR_FIRE, TR_USE, TR_RUN, TR_READ_ACTION, TR_STUN_ACTION, TR_PURGE_ACTION,
 TR_WEAPON1, TR_WEAPON2, TR_WEAPON3, TR_WEAPON4, TR_WEAPON5, TR_WEAPON6,
 TR_WEAPON7, TR_AUTOMAP, TR_MENU, TR_ACTIONS };
extern int tr_keys[3], tr_trauma, tr_rounds, tr_charges, tr_saved, tr_gore;
void TR_NewGame(void);
void TR_LevelStart(void);
void TR_Noise(mobj_t *source);
void TR_MapSpawn(mobj_t *mo);
int TR_Human(mobj_t *mo);
int TR_Think(mobj_t *mo);
void TR_PlayerThink(player_t *p);
void TR_Kill(mobj_t *source, mobj_t *target);
void TR_Damaged(mobj_t *target);
int TR_BlockDamage(mobj_t *source);
int TR_CheckAmmo(player_t *p);
void TR_SpendRound(player_t *p);
angle_t TR_Aim(void);
fixed_t TR_Sway(void);
void TR_Impact(void);
void TR_Shot(player_t *p);
int TR_Gib(mobj_t *source,mobj_t *target);
byte *TR_RedMap(byte *map);
void tremor_set_gore(int value);
void tremor_set_mouse_sensitivity(int value);
void tremor_set_volumes(int sfx,int music);
void tremor_bind_key(int action,int doomkey);
void TR_MergeCrewSprites(unsigned int first);

void TR_FlushSaves(void);

void TR_SettingsReady(void);

/* Corpse exposure, not elapsed danger: units are map units and 35 Hz tics. */
#define TR_TERROR_RANGE (1024*FRACUNIT)
#define TR_TERROR_CLOSE (256*FRACUNIT)
#define TR_TERROR_SCAN 8 /* At most eight LOS tests per player tic. */
#define TR_TERROR_DECAY 350 /* One point after ten seconds without exposure. */
#define TR_AMMO_KEEP 64 /* 64/256 map ammunition survives. */
#define TR_HIT_LOSS 179 /* At terror 100: 77/256 = 30.08% successful rolls. */
#define TR_DAMAGE_EXTRA 6 /* 0..60 percent extra incoming damage. */
#define TR_RADIO_COOLDOWN 3150 /* Ninety seconds, episode clock. */
#define TR_AMMO_DROP 31 /* 31/256 deaths drop one round. */
extern int tr_terror;
int TR_Hit(void);
int TR_Damage(int damage);
int TR_Ammo(player_t *p,int amount);
const char *TR_TerrorBucket(void);

void TR_StoryStart(void);
void TR_StoryTick(player_t *p);
void TR_Radio(int beat);
const char *TR_Objective(void);
const char *TR_RadioLog(void);
int TR_ObjectiveBearing(player_t *p);
const char *TR_ObjectiveDistance(player_t *p);

extern int tr_pitch,tr_sway,tr_autoaim;
int TR_LookCommand(void);
fixed_t TR_PitchSlope(void);

extern fixed_t tr_fraction;
void TR_RenderClock(void);
fixed_t TR_Interpolate(fixed_t old,fixed_t current);
void TR_PreviewView(void);

extern int tr_story_clock,tr_radio_last,tr_radio_bits;
void TR_QueueRadio(const char *line);

int TR_Light(sector_t *sector);
fixed_t TR_ArmY(void);
void TR_ProfileStart(void);
void TR_ProfileEnd(void);

fixed_t TR_ArmX(void);

int TR_PreviewActive(void);
extern int tr_radio_pending,tr_last_corpse;
extern char tr_radio_log[512];
void TR_ClearRadioQueue(void);
#endif /* TREMOR_H */
