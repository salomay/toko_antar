"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_update_1 = __importDefault(require("log-update"));
const codegen_1 = require("./lib/codegen");
const config_1 = __importDefault(require("./lib/config"));
const dts_1 = require("./lib/dts");
const exec_context_1 = require("./lib/exec-context");
const file_1 = require("./lib/file");
const memoize_1 = __importDefault(require("./lib/memoize"));
const print_1 = require("./lib/print");
const processGraphQLCodegenSchemaLoader = memoize_1.default(async (cwd) => {
    const [config, configHash] = await config_1.default(cwd);
    const { execContext, codegenContext } = await exec_context_1.createExecContext(cwd, config, configHash);
    const [{ skip, tsxFullPath }] = codegenContext;
    if (skip)
        return await file_1.readFile(tsxFullPath, 'utf-8');
    const [{ content }] = await codegen_1.processCodegenForContext(execContext, codegenContext);
    await dts_1.processDtsForContext(execContext, codegenContext);
    return content;
}, () => 'schemaLoader');
const graphlqCodegenSchemaLoader = function (gqlContent) {
    const callback = this.async();
    const { rootContext: cwd } = this;
    processGraphQLCodegenSchemaLoader(cwd)
        .then(() => {
        callback(undefined, gqlContent);
    })
        .catch((e) => {
        log_update_1.default.stderr(print_1.PRINT_PREFIX + e.message);
        log_update_1.default.stderr.done();
        callback(e);
    });
};
exports.default = graphlqCodegenSchemaLoader;
