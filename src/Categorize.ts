export interface ICategorize {
    [key: string]: string | number;
    [key: number]: string;
    type: string;
    value: string | number;
}

export const hasKey = <O>(obj: O, key: keyof any): key is keyof O => key in obj

export const getKeyValue = <U extends keyof T, T extends object>(key: U) => (obj: T) => obj[key];

export function categorize (token: any) : ICategorize {
    let typeCategory: ICategorize;
    if (!isNaN(parseFloat(token))) {
        typeCategory = { type: "number", value: parseFloat(token) };
        return typeCategory
    } else if (token[0] === '"' && token.slice(-1) === '"') {
        typeCategory = { type: "string", value: token.slice(1, -1) };
        return typeCategory
    } else {
        typeCategory = { type: "identifier", value: token };
        return typeCategory
    }
};
