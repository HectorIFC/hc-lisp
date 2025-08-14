import { HCValue } from './Categorize';
import { Environment } from './Context';
declare const _default: {
    parse: (input: string) => HCValue;
    interpret: (expr: HCValue, env?: Environment) => HCValue;
    eval: (input: string) => HCValue;
    evalFile: (filePath: string) => HCValue;
    formatOutput: (value: HCValue) => string;
    resetContext: () => void;
    getGlobalEnvironment: () => Environment;
};
export default _default;
//# sourceMappingURL=hc-lisp.d.ts.map