"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manipulateFromProgramPath = void 0;
const types_1 = require("../lib/types");
const ast_1 = require("./ast");
const handle_codegen_context_1 = require("./handle-codegen-context");
const manip_fns_1 = require("./manip-fns");
function manipulateFromProgramPath(cwd, programPath, configFilePath, sourceRelPath, sourceFullPath) {
    const { callExpressionPathPairs, pendingDeletion } = ast_1.visitFromProgramPath(programPath);
    if (!callExpressionPathPairs.length)
        return;
    const { execContext, schemaHash, codegenContext } = manip_fns_1.prepareToManipulate(cwd, configFilePath);
    handle_codegen_context_1.appendLiteralAndLoadCodegenContext(callExpressionPathPairs, execContext, schemaHash, sourceRelPath, sourceFullPath, codegenContext, cwd);
    ast_1.replaceCallExpressions(programPath, sourceFullPath, callExpressionPathPairs, codegenContext);
    ast_1.removeImportDeclaration(pendingDeletion);
    if (!types_1.isAllSkip(codegenContext))
        manip_fns_1.generateFilesForContextSync(execContext, codegenContext);
}
exports.manipulateFromProgramPath = manipulateFromProgramPath;
