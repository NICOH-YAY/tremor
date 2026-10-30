import type { LevelDef, World } from '../sim/types';
import { MapBuilder, crewCounts, plural } from './build';

/** Short, bounded situations (12x12) for the agent evaluation suite. Each is solvable in well under 300 macro steps. */
const line = (w: World) => {
  const c = crewCounts(w);
  return `${plural(c.alive, 'crew member', 'crew members')} alive at the exit, ${plural(c.cured, 'person', 'people')} cured, ${plural(c.lost, 'crew member', 'crew members')} lost.`;
};

// s1: a two-wide corridor; one unknown figure (crew) then one possessed between player and exit.
const s1 = new MapBuilder(12, 12, 1);
s1.room(1, 4, 3, 7).room(4, 5, 10, 6).dim(4, 5, 10, 6, 0.5);
s1.start(2, 5).end(10, 5).crew(6, 5, 30).possessed(8, 6).pickup('ammo', 2, 7);
export const s1_corridor: LevelDef = { id: 's1_corridor', title: 'Situation 1: Corridor', map: s1.map(), entities: s1.entities, endText: line };

// s2: a collared hound and an ember in a room, exit beyond.
const s2 = new MapBuilder(12, 12, 2);
s2.room(1, 4, 3, 7).room(4, 5, 4, 5).room(5, 2, 8, 9).room(9, 5, 10, 5);
s2.start(2, 5).end(10, 5).hound(6, 3, true).ember(7, 8).pickup('medkit', 2, 4).pickup('ammo', 5, 5);
export const s2_collar: LevelDef = { id: 's2_collar', title: 'Situation 2: Collar', map: s2.map(), entities: s2.entities, endText: line };

// s3: triage. Two crew, one possessed, one purge charge, a medkit.
const s3 = new MapBuilder(12, 12, 1);
s3.room(1, 2, 10, 9).wall(5, 5, 3).wall(5, 6, 3);
s3.start(1, 5).end(10, 5).crew(4, 3, 20).crew(4, 8, 20).possessed(7, 5).pickup('purge', 2, 2).pickup('medkit', 2, 9);
export const s3_triage: LevelDef = { id: 's3_triage', title: 'Situation 3: Triage', map: s3.map(), entities: s3.entities, endText: line };

// h1 (held out): dark, mixed figures.
const h1 = new MapBuilder(12, 12, 2);
h1.room(1, 3, 4, 8).room(5, 5, 5, 5).room(6, 2, 10, 9).dim(1, 3, 10, 9, 0.3);
h1.start(2, 5).end(10, 5).crew(7, 3, 30).possessed(8, 7).ember(9, 3).crew(7, 8, 30).pickup('medkit', 2, 3);
export const h1_dark: LevelDef = { id: 'h1_dark', title: 'Held-out 1: Dark', map: h1.map(), entities: h1.entities, endText: line };

// h2 (held out): a keyed door and one figure guarding the key.
const h2 = new MapBuilder(12, 12, 1);
h2.room(1, 2, 4, 9).room(5, 5, 5, 5).room(7, 2, 10, 9).door(6, 5, { key: 'red' });
h2.start(2, 5).end(10, 5).key(3, 2, 'red').possessed(3, 3).pickup('ammo', 2, 9);
export const h2_door: LevelDef = { id: 'h2_door', title: 'Held-out 2: Door', map: h2.map(), entities: h2.entities, endText: line };
