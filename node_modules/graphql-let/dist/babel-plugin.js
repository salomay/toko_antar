"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configFunction = void 0;
const helper_plugin_utils_1 = require("@babel/helper-plugin-utils");
const ast_1 = require("./call-expressions/ast");
const manip_from_program_1 = require("./call-expressions/manip-from-program");
const configFunction = (options = {}) => {
    const { configFilePath } = options;
    return {
        name: 'graphql-let/babel',
        visitor: {
            Program(programPath, state) {
                const { cwd, sourceFullPath, sourceRelPath } = ast_1.getPathsFromState(state);
                manip_from_program_1.manipulateFromProgramPath(cwd, programPath, configFilePath, sourceRelPath, sourceFullPath);
            },
        },
    };
};
exports.configFunction = configFunction;
exports.default = helper_plugin_utils_1.declare((api, options) => {
    api.assertVersion(7);
    return exports.configFunction(options);
});
