#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeHCFile = executeHCFile;
exports.showUsage = showUsage;
exports.main = main;
const hc_lisp_1 = __importDefault(require("./hc-lisp"));
function executeHCFile(filePath) {
    try {
        hc_lisp_1.default.evalFile(filePath);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error: ${errorMessage}`);
        process.exit(1);
    }
}
function showUsage() {
    console.log('Usage: npm run hclisp <file.hclisp>');
    process.exit(1);
}
function main(argv = process.argv) {
    const filePath = argv[2];
    if (!filePath) {
        showUsage();
        return;
    }
    executeHCFile(filePath);
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=hc-runner.js.map