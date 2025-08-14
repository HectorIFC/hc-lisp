"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorize = categorize;
function categorize(token) {
    if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(token)) {
        return { type: 'number', value: parseFloat(token) };
    }
    if (token[0] === '"' && token.slice(-1) === '"') {
        return { type: 'string', value: token.slice(1, -1) };
    }
    if (token === 'true') {
        return { type: 'boolean', value: true };
    }
    if (token === 'false') {
        return { type: 'boolean', value: false };
    }
    if (token === 'nil') {
        return { type: 'nil', value: null };
    }
    if (token[0] === ':') {
        return { type: 'keyword', value: token.slice(1) };
    }
    return { type: 'symbol', value: token };
}
//# sourceMappingURL=Categorize.js.map