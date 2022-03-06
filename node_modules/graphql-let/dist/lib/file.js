"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statSync = exports.readFileSync = exports.exists = exports.unlink = exports.writeFile = exports.readFile = void 0;
const fs_1 = require("fs");
exports.readFile = fs_1.promises.readFile, exports.writeFile = fs_1.promises.writeFile, exports.unlink = fs_1.promises.unlink;
var fs_2 = require("fs");
Object.defineProperty(exports, "exists", { enumerable: true, get: function () { return fs_2.exists; } });
Object.defineProperty(exports, "readFileSync", { enumerable: true, get: function () { return fs_2.readFileSync; } });
Object.defineProperty(exports, "statSync", { enumerable: true, get: function () { return fs_2.statSync; } });
