import { HCValue } from './Categorize';
import { Environment } from './Context';
import { createGlobalEnvironment } from './Library';
import { specialForms } from './Keywords';
import { NamespaceManager } from './Namespace';

export function interpret(input: HCValue, env?: Environment, nsManager?: NamespaceManager): HCValue {
  if (!env) {
    env = createGlobalEnvironment();
  }

  return evaluateExpression(input, env, nsManager);
}

function evaluateExpression(expr: HCValue, env: Environment, nsManager?: NamespaceManager): HCValue {
  switch (expr.type) {
  case 'number':
  case 'string':
  case 'boolean':
  case 'nil':
  case 'keyword':
    return expr;

  case 'symbol':
    try {
      // If we have a namespace manager, try to resolve symbol through it
      if (nsManager) {
        return nsManager.resolveSymbol(expr.value, env);
      }
      return env.get(expr.value);
    } catch (error) {
      throw new Error(`Undefined symbol: ${expr.value}`);
    }

  case 'vector':
    // Vectors evaluate their elements
    const evaluatedVector = expr.value.map(item => evaluateExpression(item, env, nsManager));
    return { type: 'vector', value: evaluatedVector };

  case 'list':
    if (expr.value.length === 0) {
      return expr; // Empty list evaluates to itself
    }

    const [first, ...rest] = expr.value;

    // Check if it's a special form
    if (first.type === 'symbol' && specialForms[first.value]) {
      return specialForms[first.value](
        rest,
        env,
        (e: HCValue, env: Environment) => evaluateExpression(e, env, nsManager),
        nsManager
      );
    }

    // Handle special built-in functions that need custom evaluation
    if (first.type === 'symbol') {
      if (first.value === 'map' && rest.length === 2) {
        const fn = evaluateExpression(rest[0], env, nsManager);
        const seq = evaluateExpression(rest[1], env, nsManager);
        return mapWithClosure(fn, seq, env, nsManager);
      }

      if (first.value === 'reduce' && rest.length === 3) {
        const fn = evaluateExpression(rest[0], env, nsManager);
        const initial = evaluateExpression(rest[1], env, nsManager);
        const seq = evaluateExpression(rest[2], env, nsManager);
        return reduceWithClosure(fn, initial, seq, env, nsManager);
      }
    }

    // Regular function call
    const fn = evaluateExpression(first, env, nsManager);
    const args = rest.map(arg => evaluateExpression(arg, env, nsManager));

    return callFunction(fn, args, env, nsManager);

  default:
    throw new Error(`Cannot evaluate expression of type: ${expr.type}`);
  }
}

function callFunction(fn: HCValue, args: HCValue[], env: Environment, nsManager?: NamespaceManager): HCValue {
  switch (fn.type) {
  case 'function':
    try {
      return fn.value(...args);
    } catch (error) {
      throw new Error(`Function call error: ${(error as Error).message}`);
    }

  case 'closure':
    const { params, body, env: closureEnv } = fn;

    if (args.length !== params.length) {
      throw new Error(`Function expects ${params.length} arguments, got ${args.length}`);
    }

    const callEnv = closureEnv.extend(params, args);

    try {
      return evaluateExpression(body, callEnv, nsManager);
    } catch (error) {
      // Handle recur for tail recursion
      if ((error as any).type === 'recur') {
        const newValues = (error as any).values as HCValue[];
        if (newValues.length !== params.length) {
          throw new Error(`recur requires ${params.length} arguments, got ${newValues.length}`);
        }

        // Create a new environment with updated parameters
        const recurEnv = closureEnv.extend(params, newValues);
        return evaluateExpression(body, recurEnv, nsManager);
      } else {
        throw error;
      }
    }

  default:
    throw new Error(`Cannot call non-function value: ${fn.type}`);
  }
}

// Enhanced map and reduce that work with closures
export function mapWithClosure(fn: HCValue, seq: HCValue, env: Environment, nsManager?: NamespaceManager): HCValue {
  if (fn.type !== 'function' && fn.type !== 'closure') {
    throw new Error('map requires a function as first argument');
  }

  if (seq.type !== 'list' && seq.type !== 'vector') {
    throw new Error('map requires a sequence as second argument');
  }

  const items = seq.value;
  const mapped = items.map(item => {
    if (fn.type === 'function') {
      return fn.value(item);
    } else {
      return callFunction(fn, [item], env, nsManager);
    }
  });

  return { type: 'list', value: mapped };
}

export function reduceWithClosure(fn: HCValue, initial: HCValue, seq: HCValue, env: Environment, nsManager?: NamespaceManager): HCValue {
  if (fn.type !== 'function' && fn.type !== 'closure') {
    throw new Error('reduce requires a function as first argument');
  }

  if (seq.type !== 'list' && seq.type !== 'vector') {
    throw new Error('reduce requires a sequence as third argument');
  }

  const items = seq.value;
  let acc = initial;

  for (const item of items) {
    if (fn.type === 'function') {
      acc = fn.value(acc, item);
    } else {
      acc = callFunction(fn, [acc, item], env, nsManager);
    }
  }

  return acc;
}
