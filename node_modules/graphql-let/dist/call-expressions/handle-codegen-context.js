"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeTiIndexForContext = exports.appendLiteralAndLoadContextForTsSources = exports.appendLiteralAndLoadCodegenContext = void 0;
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const fs_1 = require("fs");
const make_dir_1 = __importDefault(require("make-dir"));
const path_1 = require("path");
const slash_1 = __importDefault(require("slash"));
const file_1 = require("../lib/file");
const ast_1 = require("./ast");
const type_inject_1 = require("./type-inject");
function appendLiteralAndLoadCodegenContext(callExpressionPathPairs, execContext, schemaHash, sourceRelPath, sourceFullPath, codegenContext, cwd) {
    if (!callExpressionPathPairs.length)
        return;
    for (const [, value, importName] of callExpressionPathPairs) {
        switch (importName) {
            case 'gql':
                {
                    const gqlContent = value;
                    const { gqlHash, createdPaths, shouldUpdate, resolvedGqlContent, dependantFullPaths, } = type_inject_1.prepareAppendTiContext(execContext, schemaHash, sourceRelPath, sourceFullPath, gqlContent, sourceFullPath);
                    codegenContext.push({
                        ...createdPaths,
                        type: 'gql-call',
                        gqlHash,
                        gqlContent,
                        resolvedGqlContent,
                        skip: !shouldUpdate,
                        dependantFullPaths,
                    });
                }
                break;
            case 'load': {
                const gqlPathFragment = value;
                const gqlRelPath = path_1.join(path_1.dirname(sourceRelPath), gqlPathFragment);
                const gqlFullPath = path_1.join(cwd, gqlRelPath);
                const gqlContent = file_1.readFileSync(gqlFullPath, 'utf-8');
                const { gqlHash, createdPaths, shouldUpdate, dependantFullPaths, } = type_inject_1.prepareAppendTiContext(execContext, schemaHash, sourceRelPath, sourceFullPath, gqlContent, gqlFullPath);
                codegenContext.push({
                    ...createdPaths,
                    type: 'load-call',
                    gqlHash,
                    gqlPathFragment,
                    gqlRelPath,
                    gqlFullPath,
                    skip: !shouldUpdate,
                    dependantFullPaths,
                });
                break;
            }
        }
    }
}
exports.appendLiteralAndLoadCodegenContext = appendLiteralAndLoadCodegenContext;
function appendLiteralAndLoadContextForTsSources(execContext, schemaHash, codegenContext, tsSourceRelPaths) {
    const paths = [];
    if (!tsSourceRelPaths.length)
        return paths;
    const { cwd } = execContext;
    for (const sourceRelPath of tsSourceRelPaths) {
        const sourceFullPath = path_1.join(cwd, sourceRelPath);
        const sourceContent = file_1.readFileSync(sourceFullPath, 'utf-8');
        const fileNode = parser_1.parse(sourceContent, ast_1.parserOption);
        traverse_1.default(fileNode, {
            Program(programPath) {
                const { callExpressionPathPairs } = ast_1.visitFromProgramPath(programPath);
                appendLiteralAndLoadCodegenContext(callExpressionPathPairs, execContext, schemaHash, sourceRelPath, sourceFullPath, codegenContext, cwd);
                paths.push([fileNode, programPath, callExpressionPathPairs]);
            },
        });
    }
    return paths;
}
exports.appendLiteralAndLoadContextForTsSources = appendLiteralAndLoadContextForTsSources;
function writeTiIndexForContext(execContext, codegenContext) {
    const { cwd, config } = execContext;
    const typeInjectEntrypointFullPath = path_1.join(cwd, config.typeInjectEntrypoint);
    const typeInjectEntrypointFullDir = path_1.join(cwd, path_1.dirname(config.typeInjectEntrypoint));
    const gqlDtsMacroFullPath = path_1.join(typeInjectEntrypointFullDir, 'macro.d.ts');
    make_dir_1.default.sync(typeInjectEntrypointFullDir);
    let hasLiteral = false;
    let hasLoad = false;
    let dtsEntrypointContent = '';
    for (const c of codegenContext) {
        switch (c.type) {
            case 'document-import':
            case 'schema-import':
                continue;
            case 'gql-call': {
                // For TS2691
                const dtsRelPathWithoutExtension = slash_1.default(path_1.join(type_inject_1.typesRootRelDir, path_1.dirname(c.dtsRelPath), path_1.basename(c.dtsRelPath, '.d.ts')));
                dtsEntrypointContent += `import T${c.gqlHash} from './${dtsRelPathWithoutExtension}';
export function gql(gql: \`${c.gqlContent}\`): T${c.gqlHash}.__GraphQLLetTypeInjection;
`;
                hasLiteral = true;
                break;
            }
            case 'load-call': {
                // For TS2691
                const dtsRelPathWithoutExtension = slash_1.default(path_1.join(type_inject_1.typesRootRelDir, path_1.dirname(c.dtsRelPath), path_1.basename(c.dtsRelPath, '.d.ts')));
                dtsEntrypointContent += `import T${c.gqlHash} from './${dtsRelPathWithoutExtension}';
export function load(load: \`${c.gqlPathFragment}\`): T${c.gqlHash}.__GraphQLLetTypeInjection;
`;
                hasLoad = true;
                break;
            }
        }
    }
    fs_1.writeFileSync(typeInjectEntrypointFullPath, dtsEntrypointContent);
    if (hasLiteral || hasLoad) {
        fs_1.writeFileSync(gqlDtsMacroFullPath, (hasLiteral ? `export { gql } from ".";\n` : '') +
            (hasLoad ? `export { load } from ".";\n` : ''));
    }
}
exports.writeTiIndexForContext = writeTiIndexForContext;
