// This file is kept for backward compatibility but is no longer used
// The interpretation logic has been moved to Interpret.ts

import { HCValue } from "./Categorize";

export function interpretList(input: HCValue[], context: any): any {
    throw new Error("interpretList is deprecated. Use the new interpret function in Interpret.ts");
}
