"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendDocumentImportContext = void 0;
const path_1 = require("path");
const file_1 = require("./file");
const hash_1 = require("./hash");
const paths_1 = require("./paths");
function appendDocumentImportContext(execContext, schemaHash, codegenContext, gqlRelPaths, gqlContents) {
    if (!gqlRelPaths.length)
        return;
    const { cwd } = execContext;
    for (const [i, gqlRelPath] of gqlRelPaths.entries()) {
        // Loader passes gqlContent directly
        const gqlContent = gqlContents
            ? gqlContents[i]
            : file_1.readFileSync(path_1.join(cwd, gqlRelPath), 'utf-8');
        if (!gqlContent)
            throw new Error('never');
        const createdPaths = paths_1.createPaths(execContext, gqlRelPath);
        const { tsxFullPath, dtsFullPath } = createdPaths;
        // Here I add "schemaHash" as a hash seed. Types of GraphQL documents
        // basically depends on schema, which change should effect to document results.
        const gqlHash = hash_1.createHash(schemaHash + gqlContent);
        const shouldUpdate = gqlHash !== hash_1.readHash(tsxFullPath) || gqlHash !== hash_1.readHash(dtsFullPath);
        const context = {
            ...createdPaths,
            type: 'document-import',
            gqlHash,
            skip: !shouldUpdate,
        };
        codegenContext.push(context);
    }
}
exports.appendDocumentImportContext = appendDocumentImportContext;
