import { HCValue } from './Categorize';
import { Environment } from './Context';
import { NamespaceManager } from './Namespace';
export declare function interpret(input: HCValue, env?: Environment, nsManager?: NamespaceManager): HCValue;
export declare function mapWithClosure(fn: HCValue, seq: HCValue, env: Environment, nsManager?: NamespaceManager): HCValue;
export declare function reduceWithClosure(fn: HCValue, initial: HCValue, seq: HCValue, env: Environment, nsManager?: NamespaceManager): HCValue;
//# sourceMappingURL=Interpret.d.ts.map