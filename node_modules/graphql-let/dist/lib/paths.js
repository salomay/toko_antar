"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDotRelPath = exports.isTypeScriptPath = exports.isURL = exports.createSchemaPaths = exports.SCHEMA_TYPES_BASENAME = exports.createPaths = exports.toDtsPath = exports.getCacheFullDir = void 0;
const path_1 = require("path");
const type_inject_1 = require("../call-expressions/type-inject");
const getCacheFullDir = (cwd, cacheDir) => {
    return path_1.isAbsolute(cacheDir) ? cacheDir : path_1.join(cwd, cacheDir);
};
exports.getCacheFullDir = getCacheFullDir;
function toDtsPath(pathFragm) {
    return `${pathFragm}.d.ts`;
}
exports.toDtsPath = toDtsPath;
function createPaths({ cwd, cacheFullDir }, gqlRelPath) {
    const tsxRelPath = `${gqlRelPath}.tsx`;
    const tsxFullPath = path_1.join(cacheFullDir, tsxRelPath);
    const dtsRelPath = toDtsPath(gqlRelPath);
    const dtsFullPath = path_1.join(cwd, dtsRelPath);
    const gqlFullPath = path_1.join(cwd, gqlRelPath);
    return {
        gqlRelPath,
        tsxRelPath,
        tsxFullPath,
        dtsFullPath,
        dtsRelPath,
        gqlFullPath,
    };
}
exports.createPaths = createPaths;
exports.SCHEMA_TYPES_BASENAME = '__types__';
function createSchemaPaths(execContext) {
    const { cwd, config, cacheFullDir } = execContext;
    const typeInjectFullDir = path_1.join(cwd, path_1.dirname(config.typeInjectEntrypoint));
    const tsxRelPath = `${exports.SCHEMA_TYPES_BASENAME}.tsx`;
    const tsxFullPath = path_1.join(cacheFullDir, tsxRelPath);
    const dtsRelPath = `${exports.SCHEMA_TYPES_BASENAME}.d.ts`;
    const dtsFullPath = path_1.join(typeInjectFullDir, type_inject_1.typesRootRelDir, dtsRelPath);
    return {
        tsxRelPath,
        tsxFullPath,
        dtsRelPath,
        dtsFullPath,
    };
}
exports.createSchemaPaths = createSchemaPaths;
function isURL(p) {
    try {
        new URL(p);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.isURL = isURL;
function isTypeScriptPath(path) {
    const x = path_1.extname(path);
    return x === '.ts' || x === '.tsx';
}
exports.isTypeScriptPath = isTypeScriptPath;
function toDotRelPath(relPath) {
    return relPath.startsWith('.') ? relPath : './' + relPath;
}
exports.toDotRelPath = toDotRelPath;
