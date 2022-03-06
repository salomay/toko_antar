"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfigSync = exports.getConfigPath = exports.buildConfig = void 0;
const path_1 = require("path");
const string_env_interpolation_1 = require("string-env-interpolation");
const yaml_1 = require("yaml");
const consts_1 = require("./consts");
const file_1 = require("./file");
const hash_1 = require("./hash");
const paths_1 = require("./paths");
const print_1 = require("./print");
function buildConfig(raw) {
    if (typeof raw !== 'object')
        print_1.printError(new Error('A config file must shape an object'));
    if (!raw.schema || !raw.documents || !raw.plugins)
        print_1.printError(new Error(`A config requires a "${name}" field`));
    const hasUnnecessaryPlugin = raw.plugins.some((p) => {
        const name = typeof p === 'string' ? p : Object.keys(p)[0];
        return name === 'typescript';
    });
    if (hasUnnecessaryPlugin)
        print_1.printWarning(`A plugin "typescript" should not appear in your config since graphql-let automatically generates types in "graphql-let/__generated__/${paths_1.SCHEMA_TYPES_BASENAME}", which each document's output internally imports.
You can still have it, but it's redundant and can be problem if the types are massive, especially in product environment. More information: https://github.com/piglovesyou/graphql-let/issues/60
`);
    if (raw.schemaEntrypoint)
        print_1.printError(new Error(`An option "schemaEntrypoint" is deprecated. Remove it from the config and import types from "graphql-let/__generated__/${paths_1.SCHEMA_TYPES_BASENAME}".`));
    // @ts-ignore
    if (raw.gqlDtsEntrypoint)
        print_1.printError(new Error(`"gqlDtsEntrypoint" is deprecated. Rewrite the key to "typeInjectEntrypoint".`));
    const documents = Array.isArray(raw.documents)
        ? raw.documents
        : typeof raw.documents === 'string'
            ? [raw.documents]
            : print_1.printError(new Error(`config.documents should be an array or a string`));
    return {
        ...raw,
        // Normalized codegen options
        documents,
        // Set graphql-let default values
        respectGitIgnore: raw.respectGitIgnore !== undefined ? raw.respectGitIgnore : true,
        cacheDir: raw.cacheDir || 'node_modules/.cache/graphql-let',
        TSConfigFile: raw.TSConfigFile || 'tsconfig.json',
        typeInjectEntrypoint: raw.typeInjectEntrypoint || 'node_modules/@types/graphql-let/index.d.ts',
        generateOptions: raw.generateOptions || Object.create(null),
        silent: raw.silent || false,
    };
}
exports.buildConfig = buildConfig;
const getConfigPath = (cwd, configFilePath) => path_1.resolve(cwd, configFilePath || consts_1.DEFAULT_CONFIG_FILENAME);
exports.getConfigPath = getConfigPath;
const getConfigFromContent = (content) => {
    content = string_env_interpolation_1.env(content);
    return [buildConfig(yaml_1.parse(content)), hash_1.createHash(content)];
};
// Refactor with gensync
async function loadConfig(cwd, configFilePath) {
    const configPath = exports.getConfigPath(cwd, configFilePath);
    const content = await file_1.readFile(configPath, 'utf-8');
    return getConfigFromContent(content);
}
exports.default = loadConfig;
function loadConfigSync(cwd, configFilePath) {
    const configPath = exports.getConfigPath(cwd, configFilePath);
    const content = file_1.readFileSync(configPath, 'utf-8');
    return getConfigFromContent(content);
}
exports.loadConfigSync = loadConfigSync;
