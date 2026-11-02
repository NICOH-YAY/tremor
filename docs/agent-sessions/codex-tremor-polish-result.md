Implemented and left uncommitted:

- Weapon reduced to 33%, centered at 60% width above the HUD; bob/sway/recoil retained.
- Brighter ambient lighting, fog from 4–18 tiles, textured blue-grey ceiling.
- Large scaling status bar, coloured key icons, four-second fading subtitles, outlined crosshair.
- Dev-only `window.__tremor` world getter and teleport.
- Larger glitch-animated title and updated design docs.

Validation: all 98 tests, typecheck, build, and CPU budget checks pass. Debug hook is absent from production. Browser visuals and 175 FPS remain unverified.