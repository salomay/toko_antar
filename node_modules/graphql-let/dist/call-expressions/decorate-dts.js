"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendObjectExport = void 0;
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const ast_1 = require("./ast");
function appendObjectExport(dtsAST) {
    // TODO: Build ast?
    let allExportsCode = `export declare type __GraphQLLetTypeInjection = { `;
    function pushProps({ node: { id: { name }, }, }) {
        allExportsCode += `${name}: typeof ${name},`;
    }
    const visitors = {
        TSDeclareFunction: pushProps,
        VariableDeclarator: pushProps,
        // We cannot export TSTypeAliasDeclaration, since gql() cannot return type.
    };
    traverse_1.default(dtsAST, {
        ExportNamedDeclaration(path) {
            path.traverse(visitors);
        },
        Program: {
            exit(path) {
                allExportsCode += '};';
                // TODO: refactor
                traverse_1.default(parser_1.parse(allExportsCode, ast_1.parserOption), {
                    ExportNamedDeclaration({ node }) {
                        const body = path.get('body');
                        body[body.length - 1].insertAfter(node);
                    },
                });
            },
        },
    });
}
exports.appendObjectExport = appendObjectExport;
