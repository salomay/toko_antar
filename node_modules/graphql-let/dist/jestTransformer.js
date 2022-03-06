"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = require("./lib/config");
const exec_context_1 = require("./lib/exec-context");
const hash_1 = require("./lib/hash");
const paths_1 = require("./lib/paths");
function getDefaultExportIfExists(moduleName) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(moduleName);
    return ((mod === null || mod === void 0 ? void 0 : mod.default) || mod);
}
function getOption(jestConfig) {
    if (!Array.isArray(jestConfig.transform))
        return {};
    for (const [, entryPoint, opts] of jestConfig.transform) {
        if (entryPoint.endsWith('graphql-let/jestTransformer.js'))
            return opts;
    }
    return {};
}
const jestTransformer = {
    getCacheKey(sourceText, sourcePath, options) {
        const configString = (options === null || options === void 0 ? void 0 : options.configString) || options;
        return hash_1.createHash(sourceText + sourcePath + configString + 'graphql-let');
    },
    process(sourceText, sourcePath, ...rest) {
        var _a;
        // jest v26 vs v27 changes to support both formats: start
        const [__compatJestConfig] = rest;
        const jestConfig = (_a = __compatJestConfig === null || __compatJestConfig === void 0 ? void 0 : __compatJestConfig.config) !== null && _a !== void 0 ? _a : __compatJestConfig;
        // jest v26 vs v27 changes to support both formats: end
        const { rootDir: cwd } = jestConfig;
        const { configFile, subsequentTransformer } = getOption(jestConfig);
        const [config, configHash] = config_1.loadConfigSync(cwd, configFile);
        const { execContext } = exec_context_1.createExecContextSync(cwd, config, configHash);
        const { tsxFullPath } = paths_1.createPaths(execContext, path_1.relative(cwd, sourcePath));
        const tsxContent = fs_1.readFileSync(tsxFullPath, 'utf-8');
        // Let users customize a subsequent transformer
        if (subsequentTransformer) {
            const _subsequentTransformer = getDefaultExportIfExists(subsequentTransformer);
            if ('createTransformer' in _subsequentTransformer) {
                return _subsequentTransformer
                    .createTransformer({ cwd: cwd })
                    .process(tsxContent, tsxFullPath, ...rest);
            }
            return _subsequentTransformer.process(tsxContent, tsxFullPath, ...rest);
        }
        // jest v26 vs v27 changes to support both formats: start
        // "babel-jest" by default
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { createTransformer } = getDefaultExportIfExists('babel-jest');
        // jest v26 vs v27 changes to support both formats: end
        const babelTransformer = createTransformer({ cwd: cwd });
        return babelTransformer.process(tsxContent, tsxFullPath, ...rest);
    },
};
exports.default = jestTransformer;
