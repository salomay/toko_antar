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
exports.visitFromProgramPath = exports.replaceCallExpressions = exports.removeImportDeclaration = exports.visitFromCallExpressionPaths = exports.getArgumentString = exports.getProgramPath = exports.getPathsFromState = exports.parserOption = void 0;
const t = __importStar(require("@babel/types"));
const path_1 = require("path");
const slash_1 = __importDefault(require("slash"));
const paths_1 = require("../lib/paths");
const print_1 = require("../lib/print");
const VALID_IMPORT_NAMES = new Set([
    'graphql-let',
    'graphql-let/macro',
]);
exports.parserOption = {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
};
function getPathsFromState(state) {
    const { cwd } = state;
    const sourceFullPath = state.file.opts.filename;
    if (!sourceFullPath)
        throw new Error(`Couldn't find source path to traversal. Check "${JSON.stringify(state)}"`);
    const sourceRelPath = path_1.relative(cwd, sourceFullPath);
    return { cwd, sourceFullPath, sourceRelPath };
}
exports.getPathsFromState = getPathsFromState;
function getProgramPath(p) {
    if (!p)
        throw new Error('What?');
    const ancestories = p.getAncestry();
    return ancestories[ancestories.length - 1];
}
exports.getProgramPath = getProgramPath;
function getArgumentString(path) {
    let value = '';
    path.traverse({
        TemplateLiteral(path) {
            if (path.node.quasis.length !== 1) {
                print_1.printError(new Error(`TemplateLiteral of the argument must not contain arguments.`));
                return;
            }
            value = path.node.quasis[0].value.raw;
        },
        StringLiteral(path) {
            value = path.node.value;
        },
    });
    if (!value)
        print_1.printError(new Error(`Argument Check the argument.`));
    return value;
}
exports.getArgumentString = getArgumentString;
function visitFromCallExpressionPaths(gqlCallExpressionPaths, fnName) {
    const literalCallExpressionPaths = [];
    for (const path of gqlCallExpressionPaths) {
        const value = getArgumentString(path);
        if (value)
            literalCallExpressionPaths.push([path, value, fnName]);
    }
    return literalCallExpressionPaths;
}
exports.visitFromCallExpressionPaths = visitFromCallExpressionPaths;
function removeImportDeclaration(pendingDeletion) {
    for (const { path: pathToRemove } of pendingDeletion) {
        if (pathToRemove.node.specifiers.length === 1) {
            pathToRemove.remove();
        }
        else {
            pathToRemove.node.specifiers = pathToRemove.node.specifiers.filter((specifier) => {
                return specifier !== specifier;
            });
        }
    }
}
exports.removeImportDeclaration = removeImportDeclaration;
function replaceCallExpressions(programPath, sourceFullPath, callExpressionPaths, codegenContext) {
    // Filter non-targets. 'schema-import', specifically
    const callCodegenContext = codegenContext.filter(({ type }) => type === 'gql-call' || type === 'load-call');
    if (callExpressionPaths.length !== callCodegenContext.length)
        throw new Error('Number of load-call contexts and callExpressionPathPairs must be equal');
    for (const [i, [callExpressionPath]] of callExpressionPaths.entries()) {
        const { gqlHash, tsxFullPath } = callCodegenContext[i];
        const tsxRelPathFromSource = slash_1.default(paths_1.toDotRelPath(path_1.relative(path_1.dirname(sourceFullPath), tsxFullPath)));
        const localVarName = `V${gqlHash}`;
        const importNode = t.importDeclaration([t.importNamespaceSpecifier(t.identifier(localVarName))], t.valueToNode(tsxRelPathFromSource));
        programPath.unshiftContainer('body', importNode);
        callExpressionPath.replaceWithSourceString(localVarName);
    }
}
exports.replaceCallExpressions = replaceCallExpressions;
function visitFromProgramPath(programPath) {
    const pendingDeletion = [];
    const literalCallExpressionPaths = [];
    let hasError = false;
    const names = [];
    programPath.traverse({
        ImportDeclaration(path) {
            try {
                const pathValue = path.node.source.value;
                if (VALID_IMPORT_NAMES.has(pathValue)) {
                    for (const specifier of path.node.specifiers) {
                        if (!t.isImportSpecifier(specifier))
                            continue;
                        const name = specifier.imported
                            .name;
                        names.push([name, specifier.local.name]);
                        pendingDeletion.push({ specifier, path });
                    }
                }
            }
            catch (e) {
                print_1.printError(e);
                hasError = true;
            }
        },
    });
    // If no use of our library, abort quickly.
    if (!names.length)
        return {
            callExpressionPathPairs: literalCallExpressionPaths,
            hasError,
            pendingDeletion,
        };
    function processTargetCalls(path, nodeName) {
        for (const [importName, localName] of names) {
            if (!t.isIdentifier(path.get(nodeName).node, { name: localName }))
                continue;
            const value = getArgumentString(path);
            if (!value)
                print_1.printError(new Error(`Check argument.`));
            literalCallExpressionPaths.push([path, value, importName]);
        }
        // if (
        //   names.some(([importName, localName]) => {
        //     return t.isIdentifier((path.get(nodeName) as any).node, {
        //       name: localName,
        //     });
        //   })
        // ) {
        // }
    }
    programPath.traverse({
        CallExpression(path) {
            try {
                processTargetCalls(path, 'callee');
            }
            catch (e) {
                print_1.printError(e);
                hasError = true;
            }
        },
    });
    return {
        pendingDeletion,
        callExpressionPathPairs: literalCallExpressionPaths,
        hasError,
    };
}
exports.visitFromProgramPath = visitFromProgramPath;
