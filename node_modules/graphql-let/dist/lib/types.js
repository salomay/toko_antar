"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchemaImportContext = exports.isAllSkip = void 0;
function isAllSkip(codegenContext) {
    for (const { skip } of codegenContext)
        if (!skip)
            return false;
    return true;
}
exports.isAllSkip = isAllSkip;
function getSchemaImportContext(codegenContext) {
    const context = codegenContext.find(({ type }) => type === 'schema-import');
    if (!context)
        throw new Error('"schema-import" context must appear');
    return context;
}
exports.getSchemaImportContext = getSchemaImportContext;
