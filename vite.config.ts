import {readdirSync,unlinkSync} from 'node:fs';
import {resolve} from 'node:path';
import { defineConfig } from 'vitest/config';
export default defineConfig({base:'./', plugins:[{name:'omit-engine-test-fixtures',writeBundle(options){const dir=resolve(options.dir??'dist','engine-headless');for(const name of readdirSync(dir))if(name.startsWith('doom-test.'))unlinkSync(resolve(dir,name));}}], server:{port:5191}, test:{environment:'node',include:['tests/**/*.test.{ts,js}']}});
