import type { LevelDef } from '../sim/types';
import { MapBuilder, crewCounts, plural } from './build';

/**
 * Quarantine Wing: Orders (32x32, wall texture 2). Original layout.
 * Hub H with sealable door B-2 into the ward W (dying crew, shared medkits). South to lab L; the wounded
 * survivor in S (west of L) holds the blue key. Blue door east of L leads to the exit.
 * Orders escalate by trigger: seal B-2 -> survivors are behind B-2, seal anyway -> purge the ward.
 */
const b = new MapBuilder(32, 32, 2);
b.room(2, 2, 7, 7)       // A: start
  .room(8, 4, 12, 4)     // corridor
  .room(13, 2, 19, 9)    // H: hub
  .room(21, 2, 29, 9)    // W: ward
  .room(16, 10, 16, 13)  // link south
  .room(10, 14, 21, 20)  // L: lab
  .room(9, 17, 9, 17)    // link west
  .room(2, 14, 8, 20)    // S: survivor room
  .room(22, 17, 22, 17)  // link east
  .room(24, 14, 29, 20); // X: exit room
b.door(20, 5, { sealable: true }) // B-2
  .door(23, 17, { key: 'blue' });
b.dim(2, 14, 8, 20, 0.6).dim(21, 2, 29, 9, 0.7);
b.start(4, 4).end(27, 17).key(4, 17, 'blue');
// Wounded survivor holds the key; the key lies beside them.
b.crew(3, 17, 12).crew(5, 16, 40);
b.possessed(7, 19);
// Ward: dying crew sharing two medkits, with the infected among them.
b.crew(24, 4, 10).crew(26, 6, 10).crew(25, 8, 10).possessed(28, 3).ember(28, 8);
b.pickup('medkit', 22, 5).pickup('medkit', 27, 5);
// Lab: mixed.
b.possessed(13, 15).possessed(18, 19).crew(14, 18).ember(19, 16).hound(12, 19, true);
b.pickup('ammo', 11, 15).pickup('purge', 20, 15).pickup('ammo', 3, 14);
b.trigger('order1', 15, 4, 1.8, 'Command: Seal door B-2.')
  .trigger('order2', 18, 5, 1.4, 'Command: Survivors are behind B-2. Seal it anyway.')
  .trigger('order3', 16, 10, 1.0, 'Command: Purge the ward.')
  .trigger('survivor', 7, 17, 1.5, 'Survivor: The key is here. Please take it.')
  .trigger('lab', 16, 13, 1.0, 'Command: The blue door is on the east wall of the lab.');

export const quarantine: LevelDef = {
  id: 'quarantine',
  title: 'Quarantine Wing: Orders',
  map: b.map(),
  entities: b.entities,
  radio: [{ tic: 35, text: 'Command: Quarantine wing. Hold position and wait for orders.' }],
  endText(w) {
    const c = crewCounts(w);
    const sealed = w.map.doors.some(d => d.sealable && d.sealed);
    return `Door B-2 was ${sealed ? 'sealed' : 'left unsealed'}. ${plural(c.alive, 'crew member was', 'crew members were')} still alive at the exit; ${plural(c.lost, 'crew member', 'crew members')} died to your gun.`;
  },
};
export default quarantine;
