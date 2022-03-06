"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Short time memoization for async function to prevent simultaneous calls
 * between the first call and its promise resolution. In the below example,
 * 2nd and 3rd call returns the value that the 1st call resolves.
 *
 *    |------.------.------|----------->
 *   1st    2nd    3rd    1st
 *  call   call   call   call resolved
 */
function memoize(fn, createKey) {
    const processingTasks = new Map();
    // Anyone who can type better out there?
    const memoized = async (...args) => {
        const key = createKey(...args);
        if (processingTasks.has(key)) {
            return processingTasks.get(key);
        }
        const promise = fn(...args);
        processingTasks.set(key, promise);
        try {
            const resolvedValue = await promise;
            processingTasks.delete(key);
            return resolvedValue;
        }
        catch (e) {
            processingTasks.delete(key);
            throw e;
        }
    };
    return memoized;
}
exports.default = memoize;
