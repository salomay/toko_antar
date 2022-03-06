"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCodegenForContext = exports.buildCodegenConfig = void 0;
const cli_1 = require("@graphql-codegen/cli");
const make_dir_1 = __importDefault(require("make-dir"));
const path_1 = __importStar(require("path"));
const slash_1 = __importDefault(require("slash"));
const file_1 = require("./file");
const hash_1 = require("./hash");
const paths_1 = require("./paths");
const print_1 = require("./print");
const types_1 = require("./types");
const OPTIONAL_SCHEMA_PLUGINS = ['typescript-resolvers'];
function getOptionalSchemaPlugins() {
    const plugins = [];
    for (const c of OPTIONAL_SCHEMA_PLUGINS) {
        try {
            require(`@graphql-codegen/${c}`);
            plugins.push(c);
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
    }
    return plugins;
}
// To avoid unnecessary complexity, graphql-let controls
// all the presets including plugin options related to it as its spec.
// I think it works for many of users, but there could be
// cases where you need to configure this more. Issue it then.
function getFixedSchemaConfig() {
    return {
        plugins: ['typescript', ...getOptionalSchemaPlugins()],
    };
}
function createFixedDocumentPresetConfig(context, execContext, schemaTsxFullPath) {
    const { tsxFullPath } = context;
    const { config: { config: userConfig }, } = execContext;
    const relPathToSchema = slash_1.default(paths_1.toDotRelPath(path_1.default.relative(path_1.dirname(tsxFullPath), schemaTsxFullPath.slice(0, schemaTsxFullPath.length - '.tsx'.length))));
    return {
        preset: 'import-types',
        presetConfig: {
            typesPath: relPathToSchema,
            // Pass user config to presetConfig too to let them decide importTypesNamespace
            ...userConfig,
        },
    };
}
const FIXED_DOCUMENT_PLUGIN_CONFIG = { importOperationTypesFrom: '' };
function appendFixedDocumentPluginConfig(plugins) {
    return plugins.map((p) => {
        if (typeof p === 'string') {
            // Ugly patch: I think "Root Level" and "Output Level" config
            // are not passed to plugins. Only "Plugin Level" works.
            return {
                [p]: FIXED_DOCUMENT_PLUGIN_CONFIG,
            };
        }
        else {
            return { ...p, ...FIXED_DOCUMENT_PLUGIN_CONFIG };
        }
    });
}
function buildCodegenConfig(execContext, codegenContext) {
    const { cwd, config } = execContext;
    const generates = Object.create(null);
    const { 
    // dtsFullPath: schemaDtsFullPath,
    tsxFullPath: schemaTsxFullPath, } = types_1.getSchemaImportContext(codegenContext);
    for (const context of codegenContext) {
        if (context.skip)
            continue;
        const { tsxFullPath } = context;
        let opts;
        switch (context.type) {
            case 'schema-import':
                opts = getFixedSchemaConfig();
                break;
            case 'document-import':
            case 'load-call':
                opts = {
                    plugins: appendFixedDocumentPluginConfig(config.plugins),
                    documents: context.gqlRelPath,
                    ...createFixedDocumentPresetConfig(context, execContext, schemaTsxFullPath),
                };
                break;
            case 'gql-call':
                opts = {
                    plugins: appendFixedDocumentPluginConfig(config.plugins),
                    documents: context.resolvedGqlContent,
                    ...createFixedDocumentPresetConfig(context, execContext, schemaTsxFullPath),
                };
                break;
        }
        generates[tsxFullPath] = {
            ...config.generateOptions,
            ...opts,
        };
    }
    return {
        ...config,
        // Regardless of `silent` value in config,
        // we always suppress GraphQL code generator logs
        silent: true,
        // @ts-ignore
        cwd,
        // @ts-ignore This allows recognizing "#import" in GraphQL documents
        skipGraphQLImport: false,
        // In our config, "documents" should always be empty
        // since "generates" should take care of them.
        documents: undefined,
        generates,
    };
}
exports.buildCodegenConfig = buildCodegenConfig;
async function processGraphQLCodegen(execContext, codegenContext, generateArg) {
    let results;
    try {
        results = await cli_1.generate(generateArg, false);
    }
    catch (error) {
        if (error.name === 'ListrError' && error.errors != null) {
            for (const err of error.errors) {
                if (err.details)
                    err.message = `${err.message}${err.details}`;
                print_1.printError(err);
            }
        }
        throw error;
    }
    // Object option "generates" in codegen obviously doesn't guarantee result's order.
    const tsxPathTable = new Map(codegenContext.map((c) => [c.tsxFullPath, c]));
    for (const result of results) {
        const { filename, content } = result;
        const context = tsxPathTable.get(filename);
        if (!context)
            throw new Error('never');
        await make_dir_1.default(path_1.default.dirname(filename));
        await file_1.writeFile(filename, hash_1.withHash(context.gqlHash, content));
    }
    return results;
}
async function processCodegenForContext(execContext, codegenContext) {
    if (types_1.isAllSkip(codegenContext))
        return [];
    const codegenConfig = buildCodegenConfig(execContext, codegenContext);
    return await processGraphQLCodegen(execContext, codegenContext, codegenConfig);
}
exports.processCodegenForContext = processCodegenForContext;
