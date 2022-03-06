"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const minimist_1 = __importDefault(require("minimist"));
const path_1 = require("path");
const print_1 = require("./lib/print");
const argv = minimist_1.default(process.argv.slice(2), {
    alias: {
        h: 'help',
        r: 'require',
    },
});
const HELP_TEXT = `Usage: graphql-let [options] [command]

graphql-let                   Generates .graphql.d.ts beside all GraphQL documents based on .graphql-let.yml config
    --config [FILE]           Generates .graphql.d.ts given a config file
    --require (-r) [MODULE]   Load modules before running. Useful to load env vars by "--require dotenv/config"
    init                      Generates your initial .graphql-let.yml configuration file 
`;
if (argv.help) {
    console.info(HELP_TEXT);
    process.exit(0);
}
if (argv.require) {
    const moduleNames = Array.isArray(argv.require)
        ? argv.require
        : [argv.require];
    for (const name of moduleNames)
        require(name);
}
let task;
switch (argv._[0]) {
    case 'gen':
    case undefined:
        task = 'gen';
        break;
    case 'init':
        task = 'init';
        break;
    default:
        print_1.printError(new Error(HELP_TEXT));
        process.exit(1);
        break;
}
function createOpts() {
    if (argv.config) {
        return {
            cwd: path_1.resolve(process.cwd(), path_1.dirname(argv.config)),
            configFilePath: path_1.basename(argv.config),
        };
    }
    else {
        const cwd = process.cwd();
        return { cwd };
    }
}
function command(command) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fn = require(`./${command}`).default;
    return Promise.resolve(fn(createOpts()));
}
command(task).catch((err) => {
    print_1.printError(err);
    process.exit(1);
});
