"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globby = exports.writeFile = exports.readFile = void 0;
const fs_1 = __importDefault(require("fs"));
const gensync_1 = __importDefault(require("gensync"));
const globby_1 = __importDefault(require("globby"));
exports.readFile = gensync_1.default({
    sync: fs_1.default.readFileSync,
    errback: fs_1.default.readFile,
});
exports.writeFile = gensync_1.default({
    sync: fs_1.default.writeFileSync,
    errback: fs_1.default.writeFile,
});
exports.globby = gensync_1.default({
    sync: globby_1.default.sync,
    async: globby_1.default,
});
