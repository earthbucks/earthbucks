import { createRequire } from "node:module";
const dawn = createRequire(import.meta.url)("./dawn.node");
export default dawn;
export const create = dawn.create;
export const globals = dawn.globals;
