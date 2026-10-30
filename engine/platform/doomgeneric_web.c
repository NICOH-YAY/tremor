
// Tremor browser platform, GPL-2.0-or-later.
#include <emscripten.h>
#include "doomgeneric.h"
#include "d_event.h"
#include "doomstat.h"
#include "m_menu.h"
#include "m_controls.h"
#include "tremor.h"
EM_JS(void, blit, (unsigned char *p), { Module.onFrame?.(p); });
void DG_Init(void) {}
static double paused_ms;
EM_ASYNC_JS(double, settings_wait, (), { const t=performance.now(); if(!Module.settingsOpen)return 0; while(Module.settingsOpen) await new Promise(r=>setTimeout(r,20)); return performance.now()-t; });
void DG_DrawFrame(void) { blit((unsigned char*)DG_ScreenBuffer); }
void DG_SleepMs(uint32_t ms) { emscripten_sleep(ms); }
uint32_t DG_GetTicksMs(void) { return (uint32_t)(emscripten_get_now()-paused_ms); }
void DG_SetWindowTitle(const char *s) {}
int DG_GetKey(int *pressed,unsigned char *key) { return 0; }
EMSCRIPTEN_KEEPALIVE void web_key(int key,int down) { event_t e={0};e.type=down?ev_keydown:ev_keyup;e.data1=key;e.data2=key<128?key:0;D_PostEvent(&e); }
EMSCRIPTEN_KEEPALIVE void web_mouse(int buttons,int dx) { event_t e={0};e.type=ev_mouse;e.data1=buttons;e.data2=dx;D_PostEvent(&e); }
EM_JS(int, settings_is_open, (), { return Module.settingsOpen?1:0; });
static void tick(void) { if(settings_is_open())paused_ms+=settings_wait();doomgeneric_Tick(); }
int main(int argc,char **argv) { static int entered; if(entered)return 0;entered=1;doomgeneric_Create(argc,argv); emscripten_set_main_loop(tick,0,1); return 0; }

EMSCRIPTEN_KEEPALIVE void web_read_mouse(int down) { static int heldkey; if(down) heldkey=tr_keys[0]; web_key(heldkey,down); }

/* Physical input slots are browser-defined; translation stays in the platform. */
static int translations[512], input_held[512], key_refs[256];
static void release_slot(int slot) { int key=input_held[slot];if(key) {input_held[slot]=0;if(--key_refs[key]==0)web_key(key,0);} }

EMSCRIPTEN_KEEPALIVE void tremor_translate_key(int slot,int key) {
 if(slot>=0 && slot<512) { release_slot(slot); translations[slot]=(key>0&&key<256)?key:0; }
}
EMSCRIPTEN_KEEPALIVE void tremor_input(int slot,int down) {
 if(slot<0 || slot>=512) return;
 if(down) { if(!input_held[slot] && translations[slot]) { input_held[slot]=translations[slot];if(key_refs[input_held[slot]]++==0)web_key(input_held[slot],1); } }
 else release_slot(slot);
}


EMSCRIPTEN_KEEPALIVE int tremor_menu_active(void) { return menuactive || gamestate!=GS_LEVEL; }
