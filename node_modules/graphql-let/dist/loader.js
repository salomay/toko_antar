"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generator_1 = __importDefault(require("@babel/generator"));
const loader_utils_1 = require("loader-utils");
const log_update_1 = __importDefault(require("log-update"));
const path_1 = require("path");
const schema_utils_1 = require("schema-utils");
const ast_1 = require("./call-expressions/ast");
const handle_codegen_context_1 = require("./call-expressions/handle-codegen-context");
const type_inject_1 = require("./call-expressions/type-inject");
const codegen_1 = require("./lib/codegen");
const config_1 = __importDefault(require("./lib/config"));
const document_import_1 = require("./lib/document-import");
const dts_1 = require("./lib/dts");
const exec_context_1 = require("./lib/exec-context");
const file_1 = require("./lib/file");
const memoize_1 = __importDefault(require("./lib/memoize"));
const print_1 = require("./lib/print");
const types_1 = require("./lib/types");
const optionsSchema = {
    type: 'object',
    properties: {
        configFile: {
            type: 'string',
        },
    },
    required: [],
};
function parseOptions(ctx) {
    const options = loader_utils_1.getOptions(ctx);
    schema_utils_1.validate(optionsSchema, options);
    return options;
}
const processLoaderForSources = memoize_1.default(async (sourceFullPath, sourceContent, addDependency, cwd, options) => {
    const [config, configHash] = await config_1.default(cwd, options.configFile);
    const { silent } = config;
    const sourceRelPath = path_1.relative(cwd, sourceFullPath);
    if (!silent)
        print_1.updateLog(`Processing ${sourceRelPath}...`);
    const { execContext, codegenContext, schemaHash } = await exec_context_1.createExecContext(cwd, config, configHash);
    const paths = handle_codegen_context_1.appendLiteralAndLoadContextForTsSources(execContext, schemaHash, codegenContext, [sourceRelPath]);
    if (!paths.length)
        throw new Error('Never');
    // If we only have 'schema-import' context, the source
    // doesn't have any `gql()` or `load()` call. Return.
    if (codegenContext.length === 1)
        return sourceContent;
    if (types_1.isAllSkip(codegenContext)) {
        if (!silent)
            print_1.updateLog(`Nothing to do. Cache was fresh.`);
        const [{ tsxFullPath }] = codegenContext;
        return await file_1.readFile(tsxFullPath, 'utf-8');
    }
    if (!silent)
        print_1.updateLog(`Processing codegen for ${sourceRelPath}...`);
    const [[fileNode, programPath, callExpressionPathPairs]] = paths;
    // Add dependencies so editing dependent GraphQL emits HMR.
    for (const context of codegenContext) {
        switch (context.type) {
            case 'document-import':
                throw new Error('Never');
            case 'schema-import':
                // Nothing to do
                break;
            case 'gql-call':
            case 'load-call':
                for (const d of context.dependantFullPaths)
                    addDependency(d);
                break;
        }
    }
    ast_1.replaceCallExpressions(programPath, sourceFullPath, callExpressionPathPairs, codegenContext);
    handle_codegen_context_1.writeTiIndexForContext(execContext, codegenContext);
    await codegen_1.processCodegenForContext(execContext, codegenContext);
    if (!silent)
        print_1.updateLog(`Generating d.ts for ${sourceRelPath}...`);
    await dts_1.processDtsForContext(execContext, codegenContext);
    const { code } = generator_1.default(fileNode);
    if (!silent) {
        print_1.updateLog(`Done processing ${sourceRelPath}.`);
        print_1.updateLogDone();
    }
    return code;
}, (gqlFullPath) => gqlFullPath);
const processLoaderForDocuments = memoize_1.default(async (gqlFullPath, gqlContent, addDependency, cwd, options) => {
    const [config, configHash] = await config_1.default(cwd, options.configFile);
    const { silent } = config;
    const graphqlRelPath = path_1.relative(cwd, gqlFullPath);
    if (!silent)
        print_1.updateLog(`Processing ${graphqlRelPath}...`);
    const { execContext, codegenContext, schemaHash } = await exec_context_1.createExecContext(cwd, config, configHash);
    // // Having another array to capture only targets of the loader execution, excluding 'schema-import'
    // const documentImportContext: DocumentImportCodegenContext[] = [];
    // Add dependencies so editing dependent GraphQL emits HMR.
    const { dependantFullPaths } = type_inject_1.resolveGraphQLDocument(gqlFullPath, String(gqlContent), cwd);
    for (const d of dependantFullPaths)
        addDependency(d);
    // const documentImportCodegenContext: DocumentImportCodegenContext[] = [];
    await document_import_1.appendDocumentImportContext(execContext, schemaHash, codegenContext, [
        graphqlRelPath,
    ]);
    const [, fileContext] = codegenContext;
    if (!fileContext)
        throw new Error('Never');
    const { skip, tsxFullPath } = fileContext;
    if (skip) {
        if (!silent)
            print_1.updateLog(`Nothing to do. Cache was fresh.`);
        return await file_1.readFile(tsxFullPath, 'utf-8');
    }
    if (!silent)
        print_1.updateLog(`Processing codegen for ${graphqlRelPath}...`);
    const codegenOutputs = await codegen_1.processCodegenForContext(execContext, codegenContext);
    // We need to find what we generate since the array order varies.
    const documentImportCodegenResult = codegenOutputs.find(({ filename }) => filename === tsxFullPath);
    if (!documentImportCodegenResult)
        throw new Error('Output of "document-import" should appear.');
    if (!silent)
        print_1.updateLog(`Generating d.ts for ${graphqlRelPath}...`);
    await dts_1.processDtsForContext(execContext, codegenContext);
    if (!silent) {
        print_1.updateLog(`Done processing ${graphqlRelPath}.`);
        print_1.updateLogDone();
    }
    return documentImportCodegenResult.content;
}, (gqlFullPath) => gqlFullPath);
/**
 * Webpack loader to handle both *.graphql and *.ts(x).
 */
const graphQLLetLoader = function (resourceContent) {
    const callback = this.async();
    const { resourcePath: resourceFullPath, rootContext: cwd } = this;
    const options = parseOptions(this);
    const addDependency = this.addDependency.bind(this);
    let promise;
    const isTypeScriptSource = resourceFullPath.endsWith('.ts') || resourceFullPath.endsWith('.tsx');
    if (isTypeScriptSource) {
        promise = processLoaderForSources(resourceFullPath, resourceContent, addDependency, cwd, options);
    }
    else {
        promise = processLoaderForDocuments(resourceFullPath, resourceContent, addDependency, cwd, options).then((content) => {
            // Pretend .tsx for later loaders.
            // babel-loader at least doesn't respond the .graphql extension.
            this.resourcePath = `${resourceFullPath}.tsx`;
            return content;
        });
    }
    promise
        .then((tsxContent) => {
        callback(undefined, tsxContent);
    })
        .catch((e) => {
        log_update_1.default.stderr(print_1.PRINT_PREFIX + e.message);
        log_update_1.default.stderr.done();
        callback(e);
    });
};
exports.default = graphQLLetLoader;
