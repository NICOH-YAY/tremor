import type { Controller } from './types';
import type { Observation } from '../player_interface';
function navigate(o: Observation): string {
    const rows = o.automap.split('\n'), h = rows.length, w = rows[0].length, sx = Math.floor(o.pose.x), sy = Math.floor(o.pose.y);
    const queue = [{ x: sx, y: sy, path: [] as {
                x: number;
                y: number;
            }[] }], seen = new Set([`${sx},${sy}`]);
    let frontier: typeof queue[number] | undefined, exit: typeof queue[number] | undefined, keyTarget: typeof queue[number] | undefined;
    for (let i = 0; i < queue.length; i++) {
        const q = queue[i];
        if (rows[q.y][q.x] === 'E')
            exit ??= q;
        if (rows[q.y][q.x] === 'K') {
            keyTarget = q;
            break;
        }
        if (!frontier && q.path.length && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => rows[q.y + dy]?.[q.x + dx] === '?'))
            frontier = q;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const x = q.x + dx, y = q.y + dy, key = `${x},${y}`;
            if (x >= 0 && y >= 0 && x < w && y < h && !seen.has(key) && ('.KE@'.includes(rows[y][x]) || (o.keys.length > 0 && rows[y][x] === 'D'))) {
                seen.add(key);
                queue.push({ x, y, path: [...q.path, { x, y }] });
            }
        }
    }
    frontier = keyTarget ?? exit ?? frontier;
    if (!frontier)
        return 'turn_right_large';
    const next = frontier.path[0];
    if (!next)
        return 'turn_right_large';
    const angle = Math.atan2(next.y + .5 - o.pose.y, next.x + .5 - o.pose.x) - o.pose.angle, delta = Math.atan2(Math.sin(angle), Math.cos(angle)) * 180 / Math.PI;
    if (Math.abs(delta) > 65)
        return delta > 0 ? 'turn_right_large' : 'turn_left_large';
    if (Math.abs(delta) > 18)
        return delta > 0 ? 'turn_right_small' : 'turn_left_small';
    if (rows[next.y][next.x] === 'D' && Math.hypot(next.x + .5 - o.pose.x, next.y + .5 - o.pose.y) < 1.5 && o.tic % 21 === 0)
        return 'use';
    return 'forward';
}
export function baseline(careful = false): Controller {
    const attempts = new Map<number, number>();
    let previousPose = { x: 0, y: 0 }, previousAction = '';
    return { id: careful ? 'baseline_careful' : 'baseline_aggressive', async decide(o) {
            const target = o.entities.filter(e => (attempts.get(e.id) ?? 0) < 45 && e.distance <= 4 && (!careful || !e.revealed || (['possessed', 'ember', 'hound'].includes(e.kind) && e.state !== 'cured'))).sort((a, b) => a.distance - b.distance)[0];
            let action: string | undefined;
            if (target) {
                attempts.set(target.id, (attempts.get(target.id) ?? 0) + 1);
                const cross = Math.sin(target.bearingDeg * Math.PI / 180) * target.distance;
                if (Math.abs(target.bearingDeg) > 18)
                    action = target.bearingDeg > 0 ? 'turn_right_small' : 'turn_left_small';
                else if (Math.abs(cross) > .20)
                    action = cross > 0 ? 'strafe_right' : 'strafe_left';
                else if (!careful)
                    action = o.ammo ? 'fire' : undefined;
                else if (!target.revealed)
                    action = 'read';
                else if (target.kind === 'possessed' && o.purge > 0 && o.health > 35) {
                    action = target.distance > 1.2 ? 'forward' : target.state === 'stunned' ? 'purge' : 'stun';
                }
                else
                    action = o.ammo ? 'fire' : undefined;
            }
            if (previousAction.startsWith('strafe') && Math.hypot(o.pose.x - previousPose.x, o.pose.y - previousPose.y) < .04)
                action = navigate(o);
            previousPose = o.pose;
            previousAction = action ?? navigate(o);
            return { action: previousAction };
        } };
}
export const baseline_aggressive = () => baseline(false);
export const baseline_careful = () => baseline(true);
