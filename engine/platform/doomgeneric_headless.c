// Original Tremor headless platform. GPL-2.0-or-later.
#include "doomgeneric.h"
void DG_Init(void){}
void DG_DrawFrame(void){}
void DG_SleepMs(uint32_t ms){}
uint32_t DG_GetTicksMs(void){return 0;}
void DG_SetWindowTitle(const char *s){}
int DG_GetKey(int *pressed,unsigned char *key){return 0;}

#ifdef TR_WATCH
/* Browser spectator presentation only; simulation uses the unchanged agent ABI.
   No real-time main loop or native input callbacks are installed. */
#include <emscripten.h>
#include "i_video.h"
#include "st_stuff.h"
#include "hu_stuff.h"
EMSCRIPTEN_KEEPALIVE pixel_t *tremor_watch_frame(void) {
    ST_Drawer(0,1);
    HU_Drawer();
    I_FinishUpdate();
    return DG_ScreenBuffer;
}
#endif
