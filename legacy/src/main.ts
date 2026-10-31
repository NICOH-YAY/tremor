import { reset } from './legacy_player_interface';
import { idleCmd, tick, TICRATE } from './sim/world';
import { Raycaster } from './render/raycaster';
import { audio } from './audio';
import { levels } from './levels';
import type { PlayerPose, RenderView, GameEvent, World } from './sim/types';
document.body.style.cssText = 'margin:0;background:#090909;color:#eee;font-family:monospace;overflow:hidden';
const screen = document.createElement('canvas'), overlay = document.createElement('canvas'), card = document.createElement('section'), status = document.createElement('div'), subtitle = document.createElement('div');
screen.style.cssText = overlay.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated';
overlay.style.pointerEvents = 'none';
card.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#101012;text-align:center;padding:24px;gap:16px;z-index:3;box-sizing:border-box;overflow:auto';
status.style.cssText = 'position:absolute;bottom:0;left:0;right:0;height:10%;min-height:48px;display:flex;align-items:center;justify-content:space-evenly;background:repeating-linear-gradient(0deg,#252a2f 0px,#252a2f 2px,#292e33 2px,#292e33 4px);border-top:3px solid #677079;box-sizing:border-box;font:bold clamp(16px,3.9vh,40px) monospace;text-shadow:2px 2px #000;pointer-events:none';
subtitle.style.cssText = 'position:absolute;bottom:12%;left:10%;width:80%;text-align:center;font:bold max(18px,2.8vh) monospace;line-height:1.5;background:#080d12dd;box-sizing:border-box;padding:8px 16px;text-shadow:2px 2px #000;pointer-events:none';
document.body.append(screen, status, subtitle, overlay, card);
const style = document.createElement('style');
style.textContent = `@keyframes tremor-title { 0%,92%,100% { transform:translate(0);text-shadow:3px 0 #6b1818,-2px 0 #31505c } 93%,96% { transform:translate(-2px,1px);text-shadow:5px 0 #6b1818,-4px 0 #31505c } 94%,98% { transform:translate(2px,-1px) } }
.tremor-title { font-size:clamp(64px,10vw,144px)!important;animation:tremor-title 4s steps(1,end) infinite }
@media (prefers-reduced-motion:reduce) { .tremor-title { animation:none } }`;
document.head.append(style);
let world = reset(1, 'hangar'), renderer: Raycaster | undefined, mode: 'title' | 'play' | 'pause' | 'end' | 'dead' = 'title';
declare global {
    interface Window { __tremor?: { readonly world: World; teleport(x: number, y: number, angle: number): void } }
    interface ImportMeta { readonly env: { readonly DEV: boolean } }
}
if (import.meta.env.DEV) {
    window.__tremor = {
        get world() { return world; },
        teleport(x, y, angle) {
            if (![x, y, angle].every(Number.isFinite)) throw new Error('Teleport requires finite coordinates and angle');
            world.player.pos.x = prev.pos.x = x;
            world.player.pos.y = prev.pos.y = y;
            world.player.angle = prev.angle = angle;
            world.player.vel.x = world.player.vel.y = 0;
            acc = 0;
        },
    };
}
const prev: PlayerPose = { pos: { ...world.player.pos }, angle: 0 }, view: RenderView = { shake: 0, flash: 0, recoil: 0, weaponSway: 0, bob: 0 }, cmd = idleCmd(), keys = new Set<string>();
let entryTremor = 0;
let oldCrossX = 0, oldCrossY = 0, fullOverlay = true;
let mouse = 0, left = false, right = false, last = 0, acc = 0, sensitivity = 0.002, hurt = 0, pickup = 0, death = 0, readLabel = '', labelTime = 0, radioTime = 0, lastStatus = '', lastStep = 0;
try {
    sensitivity = Number(localStorage.getItem('tremor.sensitivity')) || .002;
}
catch { /* storage optional */ }
const demo = new URLSearchParams(location.search).get('level');
function button(text: string, run: () => void) { const b = document.createElement('button'); b.textContent = text; b.style.cssText = 'padding:12px 24px;background:#24242a;border:1px solid #888;color:#fff;font:18px monospace;cursor:pointer'; b.onclick = run; card.append(b); }
function heading(text: string) { const h = document.createElement('h1'); h.textContent = text; h.style.cssText = 'font-size:clamp(32px,8vw,100px);letter-spacing:.12em;margin:0'; card.append(h); }
function clearInput() { keys.clear(); mouse = 0; left = right = false; acc = 0; }
function release() { clearInput(); document.exitPointerLock?.(); }
function resume() { mode = 'play'; card.style.display = 'none'; clearInput(); try {
    screen.requestPointerLock?.()?.catch(() => { });
}
catch { /* keyboard fallback */ } }
function start(id: string, tremor = 0) { entryTremor = tremor; world = reset(1, id); world.player.tremor = entryTremor; prev.pos.x = world.player.pos.x; prev.pos.y = world.player.pos.y; prev.angle = world.player.angle; view.flash = view.recoil = view.shake = hurt = pickup = death = 0; lastStep = 0; lastStatus = ''; updateStatus(); subtitle.textContent = ''; radioTime = 0; renderer ??= new Raycaster(screen); resize(); resume(); }
function title() { mode = 'title'; release(); card.replaceChildren(); card.style.display = 'flex'; card.style.background = 'linear-gradient(#0004,#000b),url("art/title.jpg") center/cover'; heading('TREMOR'); card.querySelector('h1')?.classList.add('tremor-title'); const p = document.createElement('p'); p.textContent = 'The gun works perfectly.'; p.style.fontSize = '22px'; card.append(p); button('Click to begin', () => start(demo && levels[demo] ? demo : 'hangar')); const help = document.createElement('p'); help.style.cssText = 'line-height:1.9;background:#0009;padding:16px;white-space:pre-line'; help.textContent = 'WASD move | Mouse / arrow keys turn | Left click / Ctrl fire | Right click / R read\nF stun | Q purge (hold nearby) | E use / seal | Esc pause'; card.append(help); }
function pause() { if (mode !== 'play')
    return; mode = 'pause'; release(); card.replaceChildren(); card.style.display = 'flex'; card.style.background = '#101012ee'; heading('Paused'); button('Resume', resume); const label = document.createElement('label'); label.textContent = 'Mouse sensitivity '; const slider = document.createElement('input'); slider.type = 'range'; slider.min = '.0005'; slider.max = '.006'; slider.step = '.0001'; slider.value = String(sensitivity); slider.oninput = () => { sensitivity = Number(slider.value); try {
    localStorage.setItem('tremor.sensitivity', slider.value);
}
catch { /* storage optional */ } }; label.append(slider); card.append(label); button('Restart level', () => start(world.levelId, entryTremor)); button('Quit to title', title); }
function ended() { mode = world.outcome === 'dead' ? 'dead' : 'end'; release(); card.replaceChildren(); card.style.display = 'flex'; card.style.background = mode === 'dead' ? '#24000099' : '#101012'; heading(mode === 'dead' ? 'You died' : 'TREMOR'); if (mode === 'dead')
    button('Try again', () => start(world.levelId, entryTremor));
else {
    const p = document.createElement('p');
    p.style.cssText = 'max-width:660px;font-size:22px;line-height:1.8;white-space:pre-line';
    p.textContent = levels[world.levelId].endText(world);
    card.append(p);
    button('Continue', () => world.levelId === 'hangar' && !demo ? start('quarantine', world.player.tremor) : title());
} }
function resize() { screen.width = overlay.width = innerWidth; screen.height = overlay.height = innerHeight; renderer?.resize(innerWidth, innerHeight); lastStatus = ''; }
addEventListener('resize', resize);
addEventListener('blur', pause);
addEventListener('keydown', e => { if (e.code === 'Escape') {
    if (mode === 'pause')
        resume();
    else
        pause();
    return;
} keys.add(e.code); if (['ArrowLeft', 'ArrowRight', 'ControlLeft', 'ControlRight', 'Space'].includes(e.code))
    e.preventDefault(); });
addEventListener('keyup', e => keys.delete(e.code));
document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement)
    pause(); });
screen.oncontextmenu = e => e.preventDefault();
screen.onmousedown = e => { if (mode !== 'play')
    return; if (e.button === 0)
    left = true; if (e.button === 2)
    right = true; };
addEventListener('mouseup', e => { if (e.button === 0)
    left = false; if (e.button === 2)
    right = false; });
addEventListener('mousemove', e => { if (document.pointerLockElement === screen)
    mouse += e.movementX * sensitivity; });
function event(e: GameEvent) {
    let name: string = e.type;
    let pos = world.player.pos;
    if ('id' in e)
        pos = world.entities.find(x => x.id === e.id)?.pos ?? pos;
    if (e.type === 'noise')
        pos = e.pos;
    if (e.type === 'door') {
        pos = e;
        name = 'door';
    }
    if (e.type === 'fire') {
        name = 'shotgun';
        view.flash = view.recoil = 1;
    }
    if (e.type === 'playerHurt') {
        name = 'hurt';
        hurt = 1;
        view.shake = 6;
    }
    if (e.type === 'pickup') {
        pickup = 1;
        name = 'pickup';
    }
    if (e.type === 'cured')
        name = 'purge';
    if (e.type === 'alert')
        name = 'alert_' + (world.entities.find(x => x.id === e.id)?.kind ?? 'possessed');
    if (e.type === 'collarBreak')
        name = 'zap';
    if (e.type === 'explosion') {
        name = 'fireball';
        view.shake = Math.max(view.shake, Math.max(0, 5 - Math.hypot(pos.x - world.player.pos.x, pos.y - world.player.pos.y)));
    }
    if (e.type === 'radio') {
        subtitle.textContent = e.text;
        radioTime = 4;
    }
    if (e.type === 'read') {
        const figure = world.entities.find(x => x.id === e.id);
        readLabel = figure?.kind === 'crew' ? 'crew' : figure?.kind === 'possessed' ? 'possessed' : 'demon';
        labelTime = 1.8;
    }
    audio.play(name, pos, world.player);
}
const ctx = overlay.getContext('2d');
function frame(now: number) {
    const dt = last ? Math.min(.15, (now - last) / 1000) : 0;
    last = now;
    if (mode === 'play') {
        acc += dt;
        while (acc >= 1 / TICRATE) {
            prev.pos.x = world.player.pos.x;
            prev.pos.y = world.player.pos.y;
            prev.angle = world.player.angle;
            cmd.forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
            cmd.strafe = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
            cmd.turn = mouse + (Number(keys.has('ArrowRight')) - Number(keys.has('ArrowLeft'))) * .065;
            mouse = 0;
            cmd.fire = left || keys.has('ControlLeft') || keys.has('ControlRight');
            cmd.read = right || keys.has('KeyR');
            cmd.use = keys.has('KeyE');
            cmd.stun = keys.has('KeyF');
            cmd.purge = keys.has('KeyQ');
            tick(world, cmd);
            updateStatus();
            for (const e of world.events)
                event(e);
            acc -= 1 / TICRATE;
            if (Math.hypot(world.player.vel.x, world.player.vel.y) > .025 && world.player.bob - lastStep > .8) {
                lastStep = world.player.bob;
                audio.play('step', world.player.pos, world.player);
            }
            if (world.done) {
                ended();
                break;
            }
        }
    }
    view.flash = Math.max(0, view.flash - dt * 9);
    view.recoil *= Math.exp(-dt * 13);
    view.shake *= Math.exp(-dt * 10);
    view.weaponSway += (Math.max(-1, Math.min(1, cmd.turn * 8 + cmd.strafe * .4)) - view.weaponSway) * (1 - Math.exp(-dt * 10));
    view.bob = world.player.bob;
    hurt = Math.max(0, hurt - dt * 3);
    pickup = Math.max(0, pickup - dt * 3);
    labelTime = Math.max(0, labelTime - dt);
    radioTime = Math.max(0, radioTime - dt);
    subtitle.style.opacity = String(Math.min(1, radioTime / .6));
    if (!radioTime && subtitle.textContent)
        subtitle.textContent = '';
    if (renderer && mode !== 'title') {
        renderer.render(world, prev, mode === 'play' ? acc * TICRATE : 1, view);
        if (ctx) {
            const full = mode === 'dead' || hurt > 0 || pickup > 0;
            if (full || fullOverlay)
                ctx.clearRect(0, 0, overlay.width, overlay.height);
            else
                ctx.clearRect(oldCrossX - 90, oldCrossY - 20, 180, 65);
            fullOverlay = full;
            if (mode === 'dead') {
                death = Math.min(1, death + dt);
                ctx.fillStyle = `rgba(45,0,0,${death * .9})`;
                ctx.fillRect(0, 0, overlay.width, overlay.height);
            }
            else if (hurt || pickup) {
                ctx.fillStyle = hurt ? `rgba(160,0,0,${hurt * .18})` : `rgba(230,200,90,${pickup * .12})`;
                ctx.fillRect(0, 0, overlay.width, overlay.height);
            }
            const t = now / 1000, amplitude = world.player.tremor * 5, x = overlay.width / 2 + amplitude * (Math.sin(t * 2.7) + .4 * Math.sin(t * 6.1)), y = overlay.height / 2 + amplitude * .7 * Math.sin(t * 3.3);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x - 6, y);
            ctx.lineTo(x + 6, y);
            ctx.moveTo(x, y - 6);
            ctx.lineTo(x, y + 6);
            ctx.stroke();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            oldCrossX = x;
            oldCrossY = y;
            let target;
            for (const e of world.entities)
                if (e.id === world.player.readTargetId) {
                    target = e;
                    break;
                }
            if (target && !target.revealed) {
                ctx.beginPath();
                ctx.arc(x, y, 13, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * target.readProgress / 35);
                ctx.stroke();
            }
            if (labelTime) {
                ctx.fillStyle = '#eee';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(readLabel, x, y + 34);
            }
        }
    }
    requestAnimationFrame(frame);
}
function updateStatus() {
    const p = world.player, text = `${p.health}/${p.ammo}/${p.purgeCharges}/${p.keys.join(',')}`;
    if (text === lastStatus) return;
    status.replaceChildren();
    for (const [label, value, color] of [['HEALTH', p.health, '#ec7467'], ['AMMO', p.ammo, '#ebca77'], ['PURGE', p.purgeCharges, '#83d9c7']] as const) {
        const field = document.createElement('span');
        field.textContent = `${label} ${value}`;
        field.style.color = color;
        status.append(field);
    }
    const keyField = document.createElement('span');
    keyField.textContent = 'KEYS ';
    for (const color of ['red', 'blue'] as const) {
        const icon = document.createElement('span');
        icon.setAttribute('aria-label', `${color} key${p.keys.includes(color) ? '' : ' missing'}`);
        icon.title = icon.getAttribute('aria-label')!;
        const ink = p.keys.includes(color) ? (color === 'red' ? '#ff655b' : '#65baff') : '#535960';
        icon.style.cssText = `display:inline-block;width:.7em;height:.45em;margin:0 .2em;border:2px solid ${ink};background:linear-gradient(90deg,${ink} 30%,transparent 30%);vertical-align:middle;box-shadow:2px 2px #000`;
        keyField.append(icon);
    }
    status.append(keyField);
    lastStatus = text;
}

resize();
title();
requestAnimationFrame(frame);
