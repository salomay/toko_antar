"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDtsForContext = exports.genDts = void 0;
const generator_1 = __importDefault(require("@babel/generator"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const types_1 = require("@babel/types");
const make_dir_1 = __importDefault(require("make-dir"));
const path_1 = require("path");
const slash_1 = __importDefault(require("slash"));
const typescript_1 = require("typescript");
const ast_1 = require("../call-expressions/ast");
const decorate_dts_1 = require("../call-expressions/decorate-dts");
const file_1 = require("./file");
const hash_1 = require("./hash");
const paths_1 = require("./paths");
const types_2 = require("./types");
const essentialCompilerOptions = {
    declaration: true,
    emitDeclarationOnly: true,
    skipLibCheck: true,
    jsx: typescript_1.JsxEmit.Preserve,
    noEmit: false,
};
function fixDtsImportPaths(context, dtsAST, schemaDtsFullPath) {
    const { dtsFullPath, type } = context;
    const relPathToSchema = slash_1.default(paths_1.toDotRelPath(path_1.relative(path_1.dirname(dtsFullPath), schemaDtsFullPath.slice(0, schemaDtsFullPath.length - '.d.ts'.length))));
    traverse_1.default(dtsAST, {
        ImportDeclaration(path) {
            if (path.node.source.value.endsWith(paths_1.SCHEMA_TYPES_BASENAME)) {
                switch (type) {
                    case 'document-import':
                        path.node.source = types_1.stringLiteral('graphql-let/__generated__/__types__');
                        break;
                    case 'gql-call':
                    case 'load-call':
                        path.node.source = types_1.stringLiteral(relPathToSchema);
                        break;
                }
            }
        },
    });
    // It's okay if there's no import declaration
    return dtsAST;
}
function decorateDts(context, dtsContent, schemaDtsFullPath) {
    const { type } = context;
    const dtsAST = parser_1.parse(dtsContent, ast_1.parserOption);
    switch (type) {
        case 'load-call':
        case 'gql-call':
            decorate_dts_1.appendObjectExport(dtsAST);
        case 'document-import':
            // XXX: Ugly way to fix import paths
            fixDtsImportPaths(context, dtsAST, schemaDtsFullPath);
    }
    const { code } = generator_1.default(dtsAST);
    return code;
    // return dtsContent;
}
function resolveCompilerOptions(cwd, { TSConfigFile }) {
    const fileName = TSConfigFile || 'tsconfig.json';
    const configPath = typescript_1.findConfigFile(cwd, typescript_1.sys.fileExists, fileName);
    let compilerOptions = essentialCompilerOptions;
    if (configPath != null) {
        const { config, error } = typescript_1.readConfigFile(configPath, (name) => typescript_1.sys.readFile(name));
        if (config != null) {
            const settings = typescript_1.convertCompilerOptionsFromJson(config['compilerOptions'], cwd);
            if (settings.errors.length > 0) {
                console.log(settings.errors);
            }
            compilerOptions = { ...settings.options, ...essentialCompilerOptions };
        }
        else if (error) {
            console.error(`${error.file && error.file.fileName}: ${error.messageText}`);
        }
    }
    else {
        console.error(`Could not find a valid tsconfig file ('${fileName}').`);
    }
    return compilerOptions;
}
function genDts({ cwd, config }, tsxFullPaths) {
    const compilerOptions = resolveCompilerOptions(cwd, config);
    tsxFullPaths = tsxFullPaths.map((tsxFullPath) => slash_1.default(tsxFullPath));
    const tsxFullPathSet = new Set(tsxFullPaths);
    const compilerHost = typescript_1.createCompilerHost(compilerOptions);
    const dtsContents = [];
    compilerHost.writeFile = (name, dtsContent, writeByteOrderMark, onError, sourceFiles) => {
        // TypeScript can write `d.ts`s of submodules imported from `.tsx`s.
        // We only pick up `.d.ts`s for `.tsx` entry points.
        const [{ fileName }] = sourceFiles;
        if (!tsxFullPathSet.has(fileName))
            return;
        dtsContents.push(dtsContent);
    };
    const program = typescript_1.createProgram(tsxFullPaths, compilerOptions, compilerHost);
    const result = program.emit();
    // Make sure that the compilation is successful
    if (result.emitSkipped) {
        result.diagnostics.forEach((diagnostic) => {
            if (diagnostic.file) {
                const { line, character, } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                // log diagnostic message
                const message = typescript_1.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            }
            else {
                console.error(`${typescript_1.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
            }
        });
        throw new Error('Failed to generate .d.ts.');
    }
    if (tsxFullPaths.length !== dtsContents.length) {
        throw new Error(`Never. Requested .tsx length and result .d.ts length are not matched.`);
    }
    return dtsContents;
}
exports.genDts = genDts;
async function processDtsForContext(execContext, codegenContext) {
    if (types_2.isAllSkip(codegenContext))
        return;
    const dtsContents = genDts(execContext, codegenContext.map(({ tsxFullPath }) => tsxFullPath));
    const { dtsFullPath: schemaDtsFullPath,
    // tsxFullPath: schemaTsxFullPath,
     } = types_2.getSchemaImportContext(codegenContext);
    await make_dir_1.default(path_1.dirname(codegenContext[0].dtsFullPath));
    for (const [i, dtsContent] of dtsContents.entries()) {
        const ctx = codegenContext[i];
        const { dtsFullPath, gqlHash } = ctx;
        let content = decorateDts(ctx, dtsContent, schemaDtsFullPath);
        content = hash_1.withHash(gqlHash, content);
        await make_dir_1.default(path_1.dirname(dtsFullPath));
        await file_1.writeFile(dtsFullPath, content);
    }
}
exports.processDtsForContext = processDtsForContext;
