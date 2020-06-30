export function categorize (token: any) {
    if (!isNaN(parseFloat(token))) {
        return { type: "number", value: parseFloat(token) };
    } else if (token[0] === '"' && token.slice(-1) === '"') {
        return { type: "string", value: token.slice(1, -1) };
    } else {
        return { type: "identifier", value: token };
    }
};
