"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manipulateFromCalleeExpressionsSync = void 0;
const types_1 = require("../lib/types");
const ast_1 = require("./ast");
const handle_codegen_context_1 = require("./handle-codegen-context");
const manip_fns_1 = require("./manip-fns");
function manipulateFromCalleeExpressionsSync(cwd, gqlCalleePaths = [], loadCalleePaths = [], sourceRelPath, sourceFullPath, configFilePath) {
    if (!gqlCalleePaths.length && !(loadCalleePaths === null || loadCalleePaths === void 0 ? void 0 : loadCalleePaths.length))
        return;
    const programPath = ast_1.getProgramPath(gqlCalleePaths.concat(loadCalleePaths)[0]);
    const { execContext, schemaHash, codegenContext } = manip_fns_1.prepareToManipulate(cwd, configFilePath);
    const callExpressionPathPairs = [];
    if (gqlCalleePaths === null || gqlCalleePaths === void 0 ? void 0 : gqlCalleePaths.length)
        callExpressionPathPairs.push(...ast_1.visitFromCallExpressionPaths(gqlCalleePaths.map((p) => p.parentPath), 'gql'));
    if (loadCalleePaths === null || loadCalleePaths === void 0 ? void 0 : loadCalleePaths.length)
        callExpressionPathPairs.push(...ast_1.visitFromCallExpressionPaths(loadCalleePaths.map((p) => p.parentPath), 'load'));
    handle_codegen_context_1.appendLiteralAndLoadCodegenContext(callExpressionPathPairs, execContext, schemaHash, sourceRelPath, sourceFullPath, codegenContext, cwd);
    ast_1.replaceCallExpressions(programPath, sourceFullPath, callExpressionPathPairs, codegenContext);
    if (!types_1.isAllSkip(codegenContext))
        manip_fns_1.generateFilesForContextSync(execContext, codegenContext);
}
exports.manipulateFromCalleeExpressionsSync = manipulateFromCalleeExpressionsSync;
