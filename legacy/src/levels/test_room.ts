import type { LevelDef } from '../sim/types';
const rows=['1111111111','1000010001','1000010001','1000010001','1000000001','1000010001','1000010001','1111111111'];
export const testRoom:LevelDef={id:'test_room',title:'Test Room',map:{width:10,height:8,cells:rows.join('').split('').map(Number),doors:[{x:5,y:4,key:'red',openAmount:0,state:'closed'}],spawns:[{x:2.5,y:4.5}],keys:[{pos:{x:3.5,y:5.5},color:'red'}],exit:{x:8.5,y:4.5},triggers:[]},entities:[{kind:'possessed',pos:{x:4.2,y:2.5}},{kind:'ember',pos:{x:7.5,y:3.5}}],endText:w=>`You left with ${w.player.saved} crew.`};
