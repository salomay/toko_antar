"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExecContextSync = exports.createExecContext = void 0;
const fs_1 = require("fs");
const gensync_1 = __importDefault(require("gensync"));
const slash_1 = __importDefault(require("slash"));
const gensynced_1 = require("./gensynced");
const hash_1 = require("./hash");
const paths_1 = require("./paths");
function getSchemaPointers(schema, _acc = []) {
    if (typeof schema === 'string') {
        _acc.push(schema);
    }
    else if (Array.isArray(schema)) {
        for (const s of schema)
            getSchemaPointers(s, _acc);
    }
    else if (typeof schema === 'object') {
        for (const s of Object.keys(schema))
            getSchemaPointers(s, _acc);
    }
    return _acc;
}
function prepareCreateSchemaHashArgs(execContext) {
    const { config, configHash, cwd } = execContext;
    const schemaPointers = getSchemaPointers(config.schema);
    // TODO: How can we detect update of remote GraphQL Schema? ETag?
    // It caches the remote introspection forever in the current implementation.
    const filePointers = schemaPointers.filter((p) => !paths_1.isURL(p));
    return { configHash, cwd, filePointers };
}
const createSchemaHashGenerator = gensync_1.default(function* (execContext) {
    const { configHash, cwd, filePointers } = prepareCreateSchemaHashArgs(execContext);
    const files = yield* gensynced_1.globby(filePointers, { cwd, absolute: true });
    const contents = files
        .map(slash_1.default)
        .sort()
        .map((file) => fs_1.readFileSync(file, 'utf-8'));
    return hash_1.createHashFromBuffers([configHash, ...contents]);
});
const appendSchemaImportContextGenerator = gensync_1.default(function* (execContext, codegenContext) {
    const createdPaths = paths_1.createSchemaPaths(execContext);
    const { configHash } = execContext;
    // We start our hash seed from configHash + schemaHash.
    // If either of them changes, the hash changes, which triggers
    // cache refresh in the subsequent generation process.
    const schemaHash = hash_1.createHash(configHash + (yield* createSchemaHashGenerator(execContext)));
    const shouldUpdate = schemaHash !== hash_1.readHash(createdPaths.tsxFullPath) ||
        schemaHash !== hash_1.readHash(createdPaths.dtsFullPath);
    const context = {
        ...createdPaths,
        type: 'schema-import',
        gqlHash: schemaHash,
        skip: !shouldUpdate,
    };
    codegenContext.push(context);
    return schemaHash;
});
const createExecContextGenerator = gensync_1.default(function* (cwd, config, configHash) {
    const cacheFullDir = paths_1.getCacheFullDir(cwd, config.cacheDir);
    const execContext = {
        cwd,
        config,
        configHash,
        cacheFullDir,
    };
    const codegenContext = [];
    const schemaHash = yield* appendSchemaImportContextGenerator(execContext, codegenContext);
    return { execContext, codegenContext, schemaHash };
});
exports.createExecContext = createExecContextGenerator.async;
exports.createExecContextSync = createExecContextGenerator.sync;
