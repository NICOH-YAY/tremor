# Rule source map

Source names are research pointers, not copied implementations. Tests below identify intended coverage; pending behavior belongs to the mechanics worker.

| Rule | Source (linuxdoom-1.10 file/function, or design) | Our file | Test |
| --- | --- | --- | --- |
| TICRATE | doomdef.h / TICRATE | src/sim/types.ts | tests/sim.test.ts (interface ticks) |
| hitscan | p_map.c / P_LineAttack | src/sim/world.ts | tests/sim.test.ts (hit, occlusion) |
| noise alert | p_enemy.c / P_NoiseAlert | src/sim/rules/noise.ts | Pending |
| keyed doors | p_doors.c / EV_DoLockedDoor | src/sim/world.ts | tests/sim.test.ts (door) |
| infighting | p_inter.c / P_DamageMobj | src/sim/enemies/hound.ts | Pending |
| pain chance | info.c | src/sim/enemies/possessed.ts | Pending |
| Recognition | design | src/sim/rules/recognition.ts | Pending |
| Trauma | design | src/sim/rules/trauma.ts | Pending |
| Temptation | design | src/sim/rules/temptation.ts | Pending |
| Mercy | design | src/sim/rules/mercy.ts | Pending |
