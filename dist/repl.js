"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReplEvaluator = createReplEvaluator;
exports.createReplWriter = createReplWriter;
exports.showWelcomeMessage = showWelcomeMessage;
exports.startRepl = startRepl;
const hc_lisp_1 = __importDefault(require("./hc-lisp"));
const repl_1 = __importDefault(require("repl"));
const HC_LISP_PROMPT = 'hc-lisp> ';
function createReplEvaluator() {
    return (cmd, context, filename, callback) => {
        try {
            const input = cmd.trim();
            if (input === '') {
                callback(null, undefined);
                return;
            }
            if (input === '(exit)' || input === 'exit') {
                process.exit(0);
            }
            const result = hc_lisp_1.default.eval(input);
            const formatted = hc_lisp_1.default.formatOutput(result);
            callback(null, formatted);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            callback(null, `Error: ${errorMessage}`);
        }
    };
}
function createReplWriter() {
    return (output) => {
        if (output === undefined) {
            return '';
        }
        return output;
    };
}
function showWelcomeMessage() {
    console.log('Welcome to HC-Lisp REPL!');
    console.log('A Lisp dialect.');
    console.log('Type (exit) or Ctrl+C to quit\n');
}
function startRepl() {
    showWelcomeMessage();
    repl_1.default.start({
        prompt: HC_LISP_PROMPT,
        eval: createReplEvaluator(),
        writer: createReplWriter()
    });
}
if (require.main === module) {
    startRepl();
}
//# sourceMappingURL=repl.js.map