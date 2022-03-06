"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const babel_plugin_macros_1 = require("babel-plugin-macros");
const ast_1 = require("./call-expressions/ast");
const manip_from_callee_expressions_1 = require("./call-expressions/manip-from-callee-expressions");
const babelMacro = babel_plugin_macros_1.createMacro((params) => {
    const { references: { gql: gqlCalleePaths, load: loadCalleePaths }, state, config = {}, } = params;
    const { configFilePath } = config;
    const { cwd, sourceFullPath, sourceRelPath } = ast_1.getPathsFromState(state);
    manip_from_callee_expressions_1.manipulateFromCalleeExpressionsSync(cwd, gqlCalleePaths, loadCalleePaths, sourceRelPath, sourceFullPath, configFilePath);
});
exports.default = babelMacro;
