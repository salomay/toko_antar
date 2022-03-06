"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLogDone = exports.updateLog = exports.printError = exports.printWarning = exports.printInfo = exports.PRINT_PREFIX = void 0;
const log_update_1 = __importDefault(require("log-update"));
exports.PRINT_PREFIX = '[ graphql-let ] ';
function printInfo(message) {
    console.info(exports.PRINT_PREFIX + message);
}
exports.printInfo = printInfo;
function printWarning(message) {
    console.warn(exports.PRINT_PREFIX + message);
}
exports.printWarning = printWarning;
function printError(err) {
    console.error(exports.PRINT_PREFIX + err.toString() + '\n' + err.stack);
}
exports.printError = printError;
function updateLog(message) {
    log_update_1.default(exports.PRINT_PREFIX + message);
}
exports.updateLog = updateLog;
function updateLogDone() {
    log_update_1.default.done();
}
exports.updateLogDone = updateLogDone;
