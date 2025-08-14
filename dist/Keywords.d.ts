import { HCValue } from './Categorize';
import { Environment } from './Context';
import { NamespaceManager } from './Namespace';
export type SpecialForm = (args: HCValue[], env: Environment, interpret: (expr: HCValue, env: Environment) => HCValue, nsManager?: NamespaceManager) => HCValue;
export declare const specialForms: {
    [key: string]: SpecialForm;
};
//# sourceMappingURL=Keywords.d.ts.map