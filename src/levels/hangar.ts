import type { LevelDef } from '../sim/types';
import { MapBuilder, crewCounts, plural } from './build';

/**
 * Hangar: Outbreak (32x32, wall texture 1). Original layout.
 * Path: A start -> corridor -> B bay (dim; the unknown figure is crew) -> south link -> C yard (2 possessed + ember)
 * -> west link -> D store -> E depot (red key; taking it opens the sealed closet beside E).
 * Back through C to the red door and the lift.
 */
const b = new MapBuilder(32, 32, 1);
b.room(2, 2, 8, 8)       // A: start room
  .room(9, 5, 9, 5)      // corridor cell into the bay
  .room(10, 3, 26, 8)    // B: long bay
  .room(18, 9, 19, 13)   // link south
  .room(12, 14, 24, 20)  // C: yard
  .room(10, 17, 11, 17)  // link west
  .room(2, 14, 9, 20)    // D: store
  .room(5, 21, 5, 21)    // link south
  .room(2, 22, 9, 28)    // E: depot
  .room(11, 24, 13, 26)  // closet behind E's east wall
  .room(25, 17, 25, 17)  // east link
  .room(27, 14, 30, 20)  // F: lift
  .room(20, 1, 21, 1);   // secret alcove above the bay
b.door(20, 2)            // alcove door; flanked by a different wall texture as a hint
  .wall(19, 2, 3).wall(22, 2, 3)
  .door(10, 25, { sealed: true }) // closet door: sealed until the red key is taken
  .door(26, 17, { key: 'red' });
b.dim(10, 3, 26, 8, 0.45).dim(2, 22, 9, 28, 0.7).dim(11, 24, 13, 26, 0.3).dim(20, 1, 21, 1, 0.5);
b.start(4, 5).end(29, 17).key(5, 26, 'red');
// Encounter 1: one figure far down the bay, in dim light. It is crew.
b.crew(25, 5, 30);
// Encounter 2: the yard.
b.possessed(15, 16).possessed(20, 18).ember(22, 15);
// The closet: a collared hound that wakes when the red key is taken (integrator: trigger id closet_red).
b.hound(12, 25, true, { closet: 'red' });
// Supplies.
b.pickup('ammo', 12, 4).pickup('purge', 13, 19).pickup('purge', 7, 24).pickup('medkit', 4, 16).pickup('medkit', 21, 1).pickup('ammo', 20, 1);
b.trigger('bay', 11, 5, 1.5, 'Command: Someone is moving in the bay.')
  .trigger('yard', 18, 12, 1.5, 'Command: More contacts ahead. Take your time.')
  .trigger('store', 10, 17, 1.2, 'Command: The red keycard was last logged in the depot.')
  .trigger('closet_red', 5, 26, 0.6)
  .trigger('lift', 25, 17, 1.2, 'Command: The lift is past the red door.');

export const hangar: LevelDef = {
  id: 'hangar',
  title: 'Hangar: Outbreak',
  map: b.map(),
  entities: b.entities,
  radio: [{ tic: 35, text: 'Command: Hangar is compromised. Reach the lift.' }],
  endText(w) {
    const c = crewCounts(w);
    return `${plural(c.alive, 'crew member was', 'crew members were')} still alive when you reached the lift. ${plural(c.cured, 'person was', 'people were')} cured; ${plural(c.lost, 'crew member', 'crew members')} died to your gun.`;
  },
};
export default hangar;
