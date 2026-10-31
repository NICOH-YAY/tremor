import {reset,step,observe} from '../src/player_interface.ts';
const s=reset(17);let n=0;const t=performance.now();for(let i=0;i<200;i++){step(s,'wait');observe(s);n++;}console.log(JSON.stringify({steps:n,ms:performance.now()-t,metric:'headless wait step plus extra observe; includes software render, route, map; excludes browser blit/audio'}));
