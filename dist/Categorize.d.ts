export type HCValue = {
    type: 'number';
    value: number;
} | {
    type: 'string';
    value: string;
} | {
    type: 'boolean';
    value: boolean;
} | {
    type: 'nil';
    value: null;
} | {
    type: 'symbol';
    value: string;
} | {
    type: 'keyword';
    value: string;
} | {
    type: 'list';
    value: HCValue[];
} | {
    type: 'vector';
    value: HCValue[];
} | {
    type: 'function';
    value: (...args: any[]) => any;
    arity?: number;
} | {
    type: 'closure';
    params: string[];
    body: HCValue;
    env: any;
} | {
    type: 'recur';
    values: HCValue[];
} | {
    type: 'object';
    value: any;
};
export declare function categorize(token: string): HCValue;
//# sourceMappingURL=Categorize.d.ts.map