import { HCValue } from './Categorize';
export declare class Environment {
    private readonly bindings;
    private readonly parent;
    constructor(parent?: Environment | null);
    define(name: string, value: HCValue): void;
    get(name: string): HCValue;
    set(name: string, value: HCValue): void;
    extend(params: string[], args: HCValue[]): Environment;
}
//# sourceMappingURL=Context.d.ts.map