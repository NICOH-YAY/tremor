import { defineConfig } from 'vitest/config';
export default defineConfig({base:'./', server:{port:5191}, test:{environment:'node',include:['tests/**/*.test.{ts,js}']}});
