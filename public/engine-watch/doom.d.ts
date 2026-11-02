/** Emscripten spectator module; privately owned by the watch runner. */
declare function createDoom(options?:Record<string,unknown>):Promise<any>;
export default createDoom;
