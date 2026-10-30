import { describe, it, expect } from 'vitest';
import { reset } from '../src/legacy_player_interface';
import { idleCmd, tick } from '../src/sim/world';
import { hurtPlayer } from '../src/sim/enemies/common';
import { spawnFireball } from '../src/sim/enemies/fireball';
const advance = (w: ReturnType<typeof reset>, n = 1) => { for (let i = 0; i < n; i++)
    tick(w, idleCmd()); };
describe('merged game integration', () => {
    it('regression: player health can go negative after merge of mechanics damage', () => {
        const w = reset(17);
        w.entities = [];
        w.player.health = 1;
        hurtPlayer(w, 3);
        advance(w);
        expect(w.player.health).toBe(0);
        expect(w.done).toBe(true);
        expect(w.outcome).toBe('dead');
        hurtPlayer(w, 30);
        expect(w.player.health).toBe(0);
    });
    it('consumes supplies once and preserves a full-health medkit', () => {
        const w = reset(1, 'hangar');
        w.entities = w.entities.filter(e => e.kind === 'pickup');
        for (const item of ['medkit', 'ammo', 'purge']) {
            const e = w.entities.find(e => e.data.item === item)!;
            w.player.pos = { ...e.pos };
            if (item === 'medkit') {
                advance(w);
                expect(e.health).toBeGreaterThan(0);
                w.player.health = 50;
            }
            const before = item === 'medkit' ? w.player.health : item === 'ammo' ? w.player.ammo : w.player.purgeCharges;
            advance(w);
            expect(e.health).toBe(0);
            advance(w);
            expect(item === 'medkit' ? w.player.health : item === 'ammo' ? w.player.ammo : w.player.purgeCharges).toBe(before + (item === 'medkit' ? 25 : item === 'ammo' ? 10 : 1));
        }
    });
    it('seals a door once per press, closes first, and unseals on the next press', () => {
        const w = reset(1, 'quarantine');
        w.entities = [];
        const d = w.map.doors.find(d => d.sealable)!;
        w.player.pos = { x: d.x - .5, y: d.y + .5 };
        d.state = 'open';
        d.openAmount = 1;
        const c = idleCmd();
        c.use = true;
        tick(w, c);
        expect(d).toMatchObject({ sealed: true, state: 'closed', openAmount: 0 });
        tick(w, c);
        expect(d.sealed).toBe(true);
        advance(w);
        tick(w, c);
        expect(d.sealed).toBe(false);
    });
    it('red key releases the closet hound and a reset restores the closet', () => {
        const w = reset(1, 'hangar');
        const h = w.entities.find(e => e.data.closet === 'red')!;
        w.player.pos = { ...w.map.keys[0].pos };
        advance(w);
        expect(h.alerted).toBe(true);
        expect(w.map.doors.find(d => d.x === 10 && d.y === 25)).toMatchObject({ sealed: false, state: 'opening' });
        expect(reset(1, 'hangar').map.doors.find(d => d.x === 10 && d.y === 25)?.sealed).toBe(true);
    });
    it('shots pass fireballs without counting projectile kills and corpses expire independently', () => {
        const w = reset(1);
        w.entities = w.entities.slice(0, 1);
        const enemy = w.entities[0];
        enemy.pos = { x: 4.5, y: 4.5 };
        const f = spawnFireball(w, enemy, w.player.pos);
        f.pos = { x: 3.5, y: 4.5 };
        const c = idleCmd();
        c.fire = true;
        tick(w, c);
        expect(w.events.find(e => e.type === 'fire')).toMatchObject({ hitId: enemy.id });
        expect(w.player.kills.demons).toBe(0);
        f.health = 0;
        f.state = 'dead';
        f.data.diedAt = w.tic;
        advance(w, 8);
        expect(w.entities).toContain(f);
        advance(w);
        expect(w.entities).not.toContain(f);
    });
    it('B-2 orders cannot fire out of sequence', () => {
        const w = reset(1, 'quarantine');
        w.entities = [];
        const lines: string[] = [];
        for (const id of ['order3', 'order2', 'order1', 'order2', 'order3']) {
            w.player.pos = { ...w.map.triggers.find(t => t.id === id)!.pos };
            advance(w);
            for (const e of w.events)
                if (e.type === 'radio')
                    lines.push(e.text);
        }
        expect(lines).toEqual(['Command: Seal door B-2.', 'Command: Survivors are behind B-2. Seal it anyway.', 'Command: Purge the ward.']);
    });
});
