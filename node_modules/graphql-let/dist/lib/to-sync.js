"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSync = void 0;
// Fork version of do-sync that runs a function within the entire .js file
const caller_1 = __importDefault(require("caller"));
const child_process_1 = require("child_process");
const slash_1 = __importDefault(require("slash"));
const gen = (filename, fnName, args) => {
    return `
async function main() {
  const fn = require('${slash_1.default(filename)}')['${fnName}'];
  if (!fn) throw new Error('${fnName} is not exported in ${filename}');
  return fn(...${JSON.stringify(args)})
}
main().then(value => console.log(JSON.stringify({ type: "success", value: value })))
.catch(e => console.log(JSON.stringify({ type: "failure", value: e })));
  `;
};
function toSync(asyncFn, { filename = caller_1.default(), functionName = asyncFn.name, maxBuffer = 1000 * 1024 * 1024, ...etc } = {}) {
    if (!functionName)
        throw new Error(`Couldn't get function name. Use named function or please provide "functionName" in option manually.`);
    return (...args) => {
        const proc = child_process_1.spawnSync('node', ['-'], {
            input: gen(filename, functionName, args),
            maxBuffer,
            ...etc,
        });
        const stderr = proc.stderr.toString('utf-8').trim();
        if (stderr)
            console.error(stderr);
        if (proc.error)
            throw proc.error;
        const rsp = JSON.parse(proc.stdout.toString('utf-8'));
        if (rsp.type == 'failure')
            throw rsp.value;
        return rsp.value;
    };
}
exports.toSync = toSync;
exports.default = toSync;
