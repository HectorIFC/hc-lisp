import { HCValue } from './Categorize';
import { Environment } from './Context';
import { createGlobalEnvironment } from './Library';
import { specialForms } from './Keywords';
import { NamespaceManager } from './Namespace';
import { toJSValue, jsonToHcValue, JSONValue } from './Utils';

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
  case 'object':
    return expr;

  case 'symbol':
    try {
      if (expr.value.startsWith('@')) {
        const atomSymbol = expr.value.slice(1);
        const atom = nsManager ? nsManager.resolveSymbol(atomSymbol, env) : env.get(atomSymbol);
        if (atom.type === 'object' && atom.value.__isAtom) {
          return atom.value.value;
        }
        throw new Error(`${atomSymbol} is not an atom`);
      }

      const result = nsManager ? nsManager.resolveSymbol(expr.value, env) : env.get(expr.value);
      return result;
    } catch (error) {
      throw new Error(`Undefined symbol: ${expr.value}`);
    }

  case 'vector':
    const evaluatedVector = expr.value.map(item => evaluateExpression(item, env, nsManager));
    return { type: 'vector', value: evaluatedVector };

  case 'list':
    if (expr.value.length === 0) {
      return expr;
    }

    const [first, ...rest] = expr.value;

    if (first.type === 'symbol' && specialForms[first.value]) {
      return specialForms[first.value](
        rest,
        env,
        (e: HCValue, env: Environment) => evaluateExpression(e, env, nsManager),
        nsManager
      );
    }

    if (first.type === 'symbol') {
      if (first.value.startsWith('.-') && first.value.length > 2) {
        const propName = first.value.slice(2);
        if (rest.length === 1) {
          const obj = evaluateExpression(rest[0], env, nsManager);

          if (obj && obj.type === 'js-object' && (obj as any).__direct_js__) {
            const jsRef = (obj as any).jsRef;
            if (jsRef && typeof jsRef === 'object' && propName in jsRef) {
              const prop = (jsRef as Record<string, any>)[propName];
              return jsonToHcValue(prop as JSONValue);
            } else {
              return { type: 'nil', value: null };
            }
          }

          const jsObj = toJSValue(obj);

          if (obj && typeof obj === 'object' && (obj as any).__nodejs_context__) {
            const originalObj = (obj as any).__original_object__;
            if (originalObj && typeof originalObj === 'object') {
              if (propName in originalObj) {
                const prop = (originalObj as Record<string, any>)[propName];
                return jsonToHcValue(prop as JSONValue);
              } else {
              }
            }
          }

          if (jsObj && typeof jsObj === 'object' && propName in jsObj) {
            const prop = (jsObj as Record<string, any>)[propName];
            return jsonToHcValue(prop as JSONValue);
          }
          return { type: 'nil', value: null };
        }
      }

      if (first.value.startsWith('.') && first.value.length > 1 && !first.value.startsWith('.-')) {
        const methodName = first.value.slice(1);
        if (rest.length >= 1) {
          const obj = evaluateExpression(rest[0], env, nsManager);

          if (obj && obj.type === 'js-object' && (obj as any).__direct_js__) {
            const jsRef = (obj as any).jsRef;

            const methodArgs = rest.slice(1).map(arg => {
              const evaluated = evaluateExpression(arg, env, nsManager);
              if (evaluated.type === 'function') {
                return (...jsArgs: any[]) => {
                  return evaluated.value(...jsArgs.map(jsonToHcValue));
                };
              }
              if (evaluated.type === 'closure') {
                return (...jsArgs: any[]) => {
                  return callFunction(evaluated, jsArgs.map(jsonToHcValue), env, nsManager);
                };
              }
              return toJSValue(evaluated);
            });

            if (jsRef && typeof jsRef === 'object' && methodName in jsRef) {
              const method = (jsRef as Record<string, any>)[methodName];
              if (typeof method === 'function') {
                const result = method.apply(jsRef, methodArgs);
                return jsonToHcValue(result as JSONValue);
              }
            }
            return { type: 'nil', value: null };
          }

          const methodArgs = rest.slice(1).map(arg => {
            const evaluated = evaluateExpression(arg, env, nsManager);
            if (evaluated.type === 'function') {
              return (...jsArgs: any[]) => {
                return evaluated.value(...jsArgs.map(jsonToHcValue));
              };
            }
            if (evaluated.type === 'closure') {
              return (...jsArgs: any[]) => {
                return callFunction(evaluated, jsArgs.map(jsonToHcValue), env, nsManager);
              };
            }
            return toJSValue(evaluated);
          });

          if (obj && typeof obj === 'object' && (obj as any).type === 'js-object' && (obj as any).jsRef && (obj as any).__direct_js__) {
            const directObj = (obj as any).jsRef;
            if (directObj && typeof directObj === 'object' && methodName in directObj) {
              const method = (directObj as Record<string, any>)[methodName];
              if (typeof method === 'function') {
                try {
                  const result = method.apply(directObj, methodArgs);
                  return jsonToHcValue(result as JSONValue);
                } catch (err) {
                  throw err;
                }
              }
            }
          }

          const jsObj = toJSValue(obj);

          if (obj && typeof obj === 'object' && (obj as any).__nodejs_context__ && (obj as any).__original_object__) {
            const originalObj = (obj as any).__original_object__;
            const method = (originalObj as Record<string, any>)[methodName];
            if (typeof method === 'function') {
              if (methodName === 'listen') {
                try {
                  const result = originalObj.listen(...methodArgs);
                  return jsonToHcValue(result as JSONValue);
                } catch (err) {
                  throw err;
                }
              } else {
                const result = method.apply(originalObj, methodArgs);
                return jsonToHcValue(result as JSONValue);
              }
            }
          }

          if (jsObj && typeof jsObj === 'object' && methodName in jsObj) {
            const method = (jsObj as Record<string, any>)[methodName];
            if (typeof method === 'function') {
              try {
                const result = method(...methodArgs);
                return jsonToHcValue(result as JSONValue);
              } catch (err) {
                throw err;
              }
            }
          }
          throw new Error(`Method ${methodName} not found on object`);
        }
      }

      if (first.value === 'map' && rest.length === 2) {
        const fn = evaluateExpression(rest[0], env, nsManager);
        const seq = evaluateExpression(rest[1], env, nsManager);
        return mapWithClosure(fn, seq, env, nsManager);
      }

      if (first.value === 'filter' && rest.length === 2) {
        const fn = evaluateExpression(rest[0], env, nsManager);
        const seq = evaluateExpression(rest[1], env, nsManager);
        return filterWithClosure(fn, seq, env, nsManager);
      }

      if (first.value === 'apply' && rest.length === 2) {
        const fn = evaluateExpression(rest[0], env, nsManager);
        const argsSeq = evaluateExpression(rest[1], env, nsManager);
        return applyWithClosure(fn, argsSeq, env, nsManager);
      }

      if (first.value === 'swap!' && rest.length >= 2) {
        const atom = evaluateExpression(rest[0], env, nsManager);
        const fn = evaluateExpression(rest[1], env, nsManager);
        const args = rest.slice(2).map(arg => evaluateExpression(arg, env, nsManager));
        return swapAtom(atom, fn, args, env, nsManager);
      }

      if (first.value === 'reduce' && rest.length === 3) {
        const fn = evaluateExpression(rest[0], env, nsManager);
        const initial = evaluateExpression(rest[1], env, nsManager);
        const seq = evaluateExpression(rest[2], env, nsManager);
        return reduceWithClosure(fn, initial, seq, env, nsManager);
      }
    }

    const fn = evaluateExpression(first, env, nsManager);
    const args = rest.map(arg => evaluateExpression(arg, env, nsManager));

    return callFunction(fn, args, env, nsManager);

  default:
    throw new Error(`Cannot evaluate expression of type: ${expr.type}`);
  }
}

export function callFunction(fn: HCValue, args: HCValue[], env: Environment, nsManager?: NamespaceManager): HCValue {
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
      if ((error as any).type === 'recur') {
        const newValues = (error as any).values as HCValue[];
        if (newValues.length !== params.length) {
          throw new Error(`recur requires ${params.length} arguments, got ${newValues.length}`);
        }

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

export function filterWithClosure(fn: HCValue, seq: HCValue, env: Environment, nsManager?: NamespaceManager): HCValue {
  if (fn.type !== 'function' && fn.type !== 'closure') {
    throw new Error('filter requires a function as first argument');
  }

  if (seq.type !== 'list' && seq.type !== 'vector') {
    throw new Error('filter requires a sequence as second argument');
  }

  const items = seq.value;
  const filtered: HCValue[] = [];

  for (const item of items) {
    let result: HCValue;
    if (fn.type === 'function') {
      result = fn.value(item);
    } else {
      result = callFunction(fn, [item], env, nsManager);
    }

    const isTruthy = result.type !== 'nil' && (result.type !== 'boolean' || result.value === true);
    if (isTruthy) {
      filtered.push(item);
    }
  }

  return { type: 'list', value: filtered };
}

export function applyWithClosure(fn: HCValue, argsSeq: HCValue, env: Environment, nsManager?: NamespaceManager): HCValue {
  if (fn.type !== 'function' && fn.type !== 'closure') {
    throw new Error('apply requires a function as first argument');
  }

  if (argsSeq.type !== 'list' && argsSeq.type !== 'vector') {
    throw new Error('apply requires a sequence as second argument');
  }

  const args = argsSeq.value;
  return callFunction(fn, args, env, nsManager);
}

export function swapAtom(atom: HCValue, fn: HCValue, args: HCValue[], env: Environment, nsManager?: NamespaceManager): HCValue {
  if (atom.type !== 'object' || !atom.value.__isAtom) {
    throw new Error('swap! requires an atom as first argument');
  }

  if (fn.type !== 'function' && fn.type !== 'closure') {
    throw new Error('swap! requires a function as second argument');
  }

  const currentValue = atom.value.value;
  let newValue: HCValue;

  if (fn.type === 'function') {
    newValue = fn.value(currentValue, ...args);
  } else {
    newValue = callFunction(fn, [currentValue, ...args], env, nsManager);
  }

  atom.value.value = newValue;
  return newValue;
}
