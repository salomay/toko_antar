"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const yaml_1 = require("yaml");
const consts_1 = require("./lib/consts");
const print_1 = require("./lib/print");
const DEFAULT_CONFIG = {
    schema: '**/*.graphqls',
    documents: '**/*.graphql',
    plugins: ['typescript'],
};
const defaultYamlContent = yaml_1.stringify(DEFAULT_CONFIG);
function init({ cwd }) {
    const configPath = path_1.join(cwd, consts_1.DEFAULT_CONFIG_FILENAME);
    fs_1.writeFileSync(configPath, defaultYamlContent);
    print_1.printInfo(`${configPath} was created.`);
}
exports.default = init;
