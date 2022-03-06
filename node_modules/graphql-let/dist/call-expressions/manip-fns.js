"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFilesForContextSync = exports.generateFilesForContext = exports.prepareToManipulate = void 0;
const codegen_1 = require("../lib/codegen");
const config_1 = require("../lib/config");
const dts_1 = require("../lib/dts");
const exec_context_1 = require("../lib/exec-context");
const to_sync_1 = require("../lib/to-sync");
const handle_codegen_context_1 = require("./handle-codegen-context");
function prepareToManipulate(cwd, configFilePath) {
    const [config, configHash] = config_1.loadConfigSync(cwd, configFilePath);
    return exec_context_1.createExecContextSync(cwd, config, configHash);
}
exports.prepareToManipulate = prepareToManipulate;
async function generateFilesForContext(execContext, codegenContext) {
    handle_codegen_context_1.writeTiIndexForContext(execContext, codegenContext);
    await codegen_1.processCodegenForContext(execContext, codegenContext);
    await dts_1.processDtsForContext(execContext, codegenContext);
}
exports.generateFilesForContext = generateFilesForContext;
exports.generateFilesForContextSync = to_sync_1.toSync(generateFilesForContext);
