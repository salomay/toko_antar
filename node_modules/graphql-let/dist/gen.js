"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gen = void 0;
const fs_1 = require("fs");
const globby_1 = __importDefault(require("globby"));
const path_1 = require("path");
const slash_1 = __importDefault(require("slash"));
const handle_codegen_context_1 = require("./call-expressions/handle-codegen-context");
const type_inject_1 = require("./call-expressions/type-inject");
const codegen_1 = require("./lib/codegen");
const config_1 = __importDefault(require("./lib/config"));
const document_import_1 = require("./lib/document-import");
const dts_1 = require("./lib/dts");
const exec_context_1 = require("./lib/exec-context");
const paths_1 = require("./lib/paths");
const print_1 = require("./lib/print");
const types_1 = require("./lib/types");
async function findTargetSources({ cwd, config, }) {
    const documentPaths = await globby_1.default(config.documents, {
        cwd,
        gitignore: config.respectGitIgnore,
    });
    if (documentPaths.length === 0) {
        throw new Error(`No GraphQL documents are found from the path ${JSON.stringify(config.documents)}. Check "documents" in .graphql-let.yml.`);
    }
    const graphqlRelPaths = [];
    const tsSourceRelPaths = [];
    for (const p of documentPaths) {
        paths_1.isTypeScriptPath(p) ? tsSourceRelPaths.push(p) : graphqlRelPaths.push(p);
    }
    return { graphqlRelPaths, tsSourceRelPaths };
}
/*
 * Currently, "graphql-let" CLI only removes obsolete files. Maybe we can
 * in webpack and Babel but it should not be urgent.
 */
async function removeObsoleteFiles(execContext, codegenContext, graphqlRelPaths) {
    const { cwd, config } = execContext;
    const generatedFiles = new Set(
    // TODO: Use flatMap after unsupporting Node 10
    codegenContext
        .reduce((acc, { tsxFullPath, dtsFullPath }) => acc.concat([tsxFullPath, dtsFullPath]), [])
        .map(slash_1.default));
    const globsToRemove = new Set();
    for (const relPath of graphqlRelPaths) {
        const ext = path_1.extname(relPath);
        const pattern = paths_1.toDtsPath(path_1.join(cwd, path_1.dirname(relPath), '*' + ext));
        globsToRemove.add(pattern);
    }
    const projectTypeInjectFullDir = path_1.join(cwd, path_1.dirname(config.typeInjectEntrypoint), type_inject_1.typesRootRelDir, '**/*');
    globsToRemove.add(projectTypeInjectFullDir);
    const cacheFullDir = path_1.join(cwd, config.cacheDir, '**/*');
    globsToRemove.add(cacheFullDir);
    const candidates = await globby_1.default(Array.from(globsToRemove).map(slash_1.default), {
        absolute: true,
    });
    for (const fullPath of candidates.map(slash_1.default))
        if (!generatedFiles.has(fullPath))
            fs_1.unlinkSync(fullPath);
}
async function gen({ cwd, configFilePath, }) {
    const [config, configHash] = await config_1.default(cwd, configFilePath);
    const { silent } = config;
    if (!silent)
        print_1.updateLog('Scanning...');
    const { execContext, codegenContext, schemaHash } = await exec_context_1.createExecContext(cwd, config, configHash);
    const { graphqlRelPaths, tsSourceRelPaths } = await findTargetSources(execContext);
    document_import_1.appendDocumentImportContext(execContext, schemaHash, codegenContext, graphqlRelPaths);
    handle_codegen_context_1.appendLiteralAndLoadContextForTsSources(execContext, schemaHash, codegenContext, tsSourceRelPaths);
    if (types_1.isAllSkip(codegenContext)) {
        if (!silent)
            print_1.updateLog(`Nothing to do. Caches for ${codegenContext.length} GraphQL documents are fresh.`);
    }
    else {
        const numToProcess = codegenContext.reduce((i, { skip }) => (skip ? i : i + 1), 0);
        if (!silent)
            print_1.updateLog(`Processing ${numToProcess} codegen...`);
        handle_codegen_context_1.writeTiIndexForContext(execContext, codegenContext);
        await codegen_1.processCodegenForContext(execContext, codegenContext);
        if (!silent)
            print_1.updateLog(`Generating ${numToProcess} d.ts...`);
        await dts_1.processDtsForContext(execContext, codegenContext);
        const displayNum = numToProcess === codegenContext.length
            ? numToProcess
            : `${numToProcess}/${codegenContext.length}`;
        if (!silent)
            print_1.updateLog(`Done processing ${displayNum} GraphQL documents.`);
    }
    await removeObsoleteFiles(execContext, codegenContext, graphqlRelPaths);
    return codegenContext;
}
exports.gen = gen;
exports.default = gen;
