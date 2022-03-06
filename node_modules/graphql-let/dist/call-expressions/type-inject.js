"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareAppendTiContext = exports.resolveGraphQLDocument = exports.createTiPaths = exports.typesRootRelDir = void 0;
const import_1 = require("@graphql-tools/import");
const graphql_1 = require("graphql");
const path_1 = require("path");
const hash_1 = require("../lib/hash");
exports.typesRootRelDir = '__generated__';
function createTiPaths(execContext, srcRelPath, callIdentity) {
    const abs = (relPath) => path_1.join(cwd, relPath);
    const { cwd, config, cacheFullDir } = execContext;
    const typeInjectFullDir = path_1.join(cwd, path_1.dirname(config.typeInjectEntrypoint));
    // srcRelPath: "pages/index.tsx"
    // "pages"
    const relDir = path_1.dirname(srcRelPath);
    // ".tsx"
    const ext = path_1.extname(srcRelPath);
    // "${cwd}/pages/index.tsx"
    const srcFullPath = abs(srcRelPath);
    // "index"
    const base = path_1.basename(srcRelPath, ext);
    // "index-2345.tsx"
    const tsxBasename = `${base}-${callIdentity}${ext}`;
    // "pages/index-2345.tsx"
    const tsxRelPath = path_1.join(relDir, tsxBasename);
    // "/Users/.../node_modules/graphql-let/__generated__/pages/index-2345.d.ts"
    const tsxFullPath = path_1.join(cacheFullDir, tsxRelPath);
    // "index-2345.d.ts"
    const dtsBasename = `${base}-${callIdentity}.d.ts`;
    // "pages/index-2345.d.ts"
    const dtsRelPath = path_1.join(relDir, dtsBasename);
    // "/Users/.../node_modules/@types/graphql-let/pages/index-2345.d.ts"
    const dtsFullPath = path_1.join(typeInjectFullDir, exports.typesRootRelDir, dtsRelPath);
    return {
        srcRelPath,
        srcFullPath,
        tsxRelPath,
        tsxFullPath,
        dtsRelPath,
        dtsFullPath,
    };
}
exports.createTiPaths = createTiPaths;
function resolveGraphQLDocument(importRootPath, gqlContent, cwd) {
    // This allows to start from content of GraphQL document, not file path
    const predefinedImports = { [importRootPath]: gqlContent };
    const map = new Map();
    const documentNode = import_1.processImport(importRootPath, cwd, predefinedImports, map);
    const dependantFullPaths = Array.from(map.keys());
    return { documentNode, dependantFullPaths };
}
exports.resolveGraphQLDocument = resolveGraphQLDocument;
function prepareAppendTiContext(execContext, schemaHash, sourceRelPath, sourceFullPath, gqlContent, importRootPath) {
    const { cwd } = execContext;
    const { documentNode, dependantFullPaths } = resolveGraphQLDocument(importRootPath, gqlContent, cwd);
    const resolvedGqlContent = graphql_1.print(documentNode);
    const documentName = documentNode.definitions
        .map((d) => d.name.value)
        .join('-');
    // We should use raw gqlContent instead of modified version resolvedGqlContent to get hash.
    const gqlHash = hash_1.createHash(schemaHash + gqlContent);
    const createdPaths = createTiPaths(execContext, sourceRelPath, documentName);
    const { tsxFullPath, dtsFullPath } = createdPaths;
    const shouldUpdate = gqlHash !== hash_1.readHash(tsxFullPath) || gqlHash !== hash_1.readHash(dtsFullPath);
    return {
        gqlHash,
        createdPaths,
        shouldUpdate,
        resolvedGqlContent,
        dependantFullPaths,
    };
}
exports.prepareAppendTiContext = prepareAppendTiContext;
