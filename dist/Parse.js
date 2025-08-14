"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
const Parenthesize_1 = require("./Parenthesize");
const Tokenizer_1 = require("./Tokenizer");
function parse(input) {
    const tokens = (0, Tokenizer_1.tokenizer)(input);
    if (tokens.length === 0) {
        return { type: 'nil', value: null };
    }
    return (0, Parenthesize_1.parenthesize)(tokens);
}
//# sourceMappingURL=Parse.js.map