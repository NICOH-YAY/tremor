
// Tremor browser platform, GPL-2.0-or-later.
#include <emscripten.h>
#include "doomgeneric.h"
#include "d_event.h"
#include "m_controls.h"
#include "tremor.h"
EM_JS(void, blit, (unsigned char *p), { Module.onFrame?.(HEAPU8.subarray(p,p+320*200*4)); });
void DG_Init(void) {}
void DG_DrawFrame(void) { blit((unsigned char*)DG_ScreenBuffer); }
void DG_SleepMs(uint32_t ms) { emscripten_sleep(ms); }
uint32_t DG_GetTicksMs(void) { return (uint32_t)emscripten_get_now(); }
void DG_SetWindowTitle(const char *s) {}
int DG_GetKey(int *pressed,unsigned char *key) { return 0; }
EMSCRIPTEN_KEEPALIVE void web_key(int key,int down) { event_t e={0};e.type=down?ev_keydown:ev_keyup;e.data1=key;e.data2=key<128?key:0;D_PostEvent(&e); }
EMSCRIPTEN_KEEPALIVE void web_mouse(int buttons,int dx) { event_t e={0};e.type=ev_mouse;e.data1=buttons;e.data2=dx;D_PostEvent(&e); }
int main(int argc,char **argv) { doomgeneric_Create(argc,argv); emscripten_set_main_loop(doomgeneric_Tick,0,1); return 0; }

EMSCRIPTEN_KEEPALIVE void web_read_mouse(int down) { static int heldkey; if(down) heldkey=tr_keys[0]; web_key(heldkey,down); }
