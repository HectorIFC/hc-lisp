import { HCValue } from './Categorize';
import { Environment } from './Context';
import { NamespaceManager } from './Namespace';
import { toJSValue, jsonToHcValue, JSONValue } from './Utils';
import { callFunction } from './Interpret';

export type SpecialForm = (
    args: HCValue[],
    env: Environment,
    interpret: (expr: HCValue, env: Environment) => HCValue,
    nsManager?: NamespaceManager
) => HCValue;

function defineFunction(
  keyword: string,
  args: HCValue[],
  env: Environment,
  interpret: any,
  nsManager?: NamespaceManager
): HCValue {
  if (args.length < 3) {
    throw new Error(`${keyword} requires at least 3 arguments`);
  }

  const nameExpr = args[0];
  if (nameExpr.type !== 'symbol') {
    throw new Error(`${keyword} requires a symbol as first argument`);
  }

  let docstring = '';
  let paramList: HCValue;
  let bodyExpressions: HCValue[];

  if (args[1].type === 'string' && args.length >= 4) {
    docstring = args[1].value as string;
    paramList = args[2];
    bodyExpressions = args.slice(3);
  } else {
    paramList = args[1];
    bodyExpressions = args.slice(2);
  }

  if (!paramList || (paramList.type !== 'list' && paramList.type !== 'vector')) {
    throw new Error(`${keyword} requires a parameter list`);
  }

  const params = (paramList.value as HCValue[]).map(param => {
    if (param.type !== 'symbol') {
      throw new Error('Parameter names must be symbols');
    }
    return param.value;
  });

  const body: HCValue = bodyExpressions.length === 1
    ? bodyExpressions[0]
    : {
      type: 'list',
      value: [{ type: 'symbol', value: 'do' }, ...bodyExpressions]
    };

  const closure: HCValue = {
    type: 'closure',
    params,
    body,
    env
  };

  env.define(nameExpr.value, closure);
  return closure;
}

export const specialForms: { [key: string]: SpecialForm } = {
  'def': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    if (args.length !== 2) {
      throw new Error('def requires exactly 2 arguments');
    }

    const nameExpr = args[0];
    if (nameExpr.type !== 'symbol') {
      throw new Error('def requires a symbol as first argument');
    }

    const value = interpret(args[1], env);
    env.define(nameExpr.value, value);
    return value;
  },

  'defn': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    return defineFunction('defn', args, env, interpret, nsManager);
  },

  'defun': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    return defineFunction('defun', args, env, interpret, nsManager);
  },

  'define': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    return defineFunction('define', args, env, interpret, nsManager);
  },

  'fn': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    if (args.length !== 2) {
      throw new Error('fn requires exactly 2 arguments');
    }

    const paramList = args[0];
    const body = args[1];

    if (!paramList || (paramList.type !== 'list' && paramList.type !== 'vector')) {
      throw new Error('fn requires a parameter list');
    }

    const params = (paramList.value as HCValue[]).map(param => {
      if (param.type !== 'symbol') {
        throw new Error('Parameter names must be symbols');
      }
      return param.value;
    });

    return {
      type: 'closure',
      params,
      body,
      env
    };
  },

  'let': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    if (args.length < 2) {
      throw new Error('let requires at least 2 arguments');
    }

    const bindingList = args[0];
    const bodyExpressions = args.slice(1);

    if (!bindingList || (bindingList.type !== 'list' && bindingList.type !== 'vector')) {
      throw new Error('let requires a binding list');
    }

    const bindings = bindingList.value as HCValue[];
    if (bindings.length % 2 !== 0) {
      throw new Error('let binding list must have an even number of elements');
    }

    const letEnv = new Environment(env);

    for (let i = 0; i < bindings.length; i += 2) {
      const name = bindings[i];
      const valueExpr = bindings[i + 1];

      if (name.type !== 'symbol') {
        throw new Error('let binding names must be symbols');
      }

      const value = interpret(valueExpr, letEnv);
      letEnv.define(name.value, value);
    }

    let result: HCValue = { type: 'nil', value: null };
    for (const expr of bodyExpressions) {
      result = interpret(expr, letEnv);
    }
    return result;
  },

  'loop': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    if (args.length !== 2) {
      throw new Error('loop requires exactly 2 arguments');
    }

    const bindingList = args[0];
    const body = args[1];

    if (!bindingList || (bindingList.type !== 'list' && bindingList.type !== 'vector')) {
      throw new Error('loop requires a binding list');
    }

    const bindings = bindingList.value as HCValue[];
    if (bindings.length % 2 !== 0) {
      throw new Error('loop binding list must have an even number of elements');
    }

    const loopEnv = new Environment(env);
    const paramNames: string[] = [];
    const initialValues: HCValue[] = [];

    for (let i = 0; i < bindings.length; i += 2) {
      const name = bindings[i];
      const valueExpr = bindings[i + 1];

      if (name.type !== 'symbol') {
        throw new Error('loop binding names must be symbols');
      }

      const value = interpret(valueExpr, env);
      loopEnv.define(name.value, value);
      paramNames.push(name.value);
      initialValues.push(value);
    }

    while (true) {
      try {
        const result = interpret(body, loopEnv);
        return result;
      } catch (error) {
        if ((error as any).type === 'recur') {
          const newValues = (error as any).values as HCValue[];
          if (newValues.length !== paramNames.length) {
            throw new Error(`recur requires ${paramNames.length} arguments, got ${newValues.length}`);
          }

          for (let i = 0; i < paramNames.length; i++) {
            loopEnv.set(paramNames[i], newValues[i]);
          }
          continue;
        } else {
          throw error;
        }
      }
    }
  },

  'recur': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    const values = args.map(arg => interpret(arg, env));
    throw { type: 'recur', values };
  },

  'if': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    if (args.length < 2 || args.length > 3) {
      throw new Error('if requires 2 or 3 arguments');
    }

    const condition = interpret(args[0], env);
    const isTruthy = condition.type !== 'nil' &&
                        (condition.type !== 'boolean' || condition.value === true);

    if (isTruthy) {
      return interpret(args[1], env);
    } else if (args.length === 3) {
      return interpret(args[2], env);
    } else {
      return { type: 'nil', value: null };
    }
  },

  'quote': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    if (args.length !== 1) {
      throw new Error('quote requires exactly 1 argument');
    }
    return args[0];
  },

  'do': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    let result: HCValue = { type: 'nil', value: null };
    for (const expr of args) {
      result = interpret(expr, env);
    }
    return result;
  },

  'ns': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    if (!nsManager) {
      throw new Error('Namespace manager not available');
    }

    if (args.length < 1) {
      throw new Error('ns requires at least a namespace name');
    }

    const nameExpr = args[0];
    if (nameExpr.type !== 'symbol') {
      throw new Error('ns requires a symbol as namespace name');
    }

    const nsName = nameExpr.value;

    let ns = nsManager.getNamespace(nsName);
    if (!ns) {
      ns = nsManager.createNamespace(nsName, env);
    }

    nsManager.setCurrentNamespace(nsName);

    for (let i = 1; i < args.length; i++) {
      const clause = args[i];
      if (clause.type === 'list' && clause.value.length > 0) {
        const keyword = clause.value[0];
        if (keyword.type === 'keyword') {
          if (keyword.value === 'import') {
            processImport(clause.value.slice(1), nsManager);
          } else if (keyword.value === 'require') {
            processRequire(clause.value.slice(1), nsManager);
          }
        }
      }
    }

    return { type: 'keyword', value: nsName };
  },

  'cond': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    for (let i = 0; i < args.length; i += 2) {
      if (i + 1 >= args.length) {
        throw new Error('cond requires an even number of arguments');
      }

      const condition = args[i];
      const body = args[i + 1];

      if (condition.type === 'keyword' && condition.value === 'else') {
        return interpret(body, env);
      }

      const conditionResult = interpret(condition, env);
      const isTruthy = conditionResult.type !== 'nil' &&
                      (conditionResult.type !== 'boolean' || conditionResult.value === true);

      if (isTruthy) {
        return interpret(body, env);
      }
    }

    return { type: 'nil', value: null };
  },

  'and': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    for (const arg of args) {
      const result = interpret(arg, env);
      const isTruthy = result.type !== 'nil' &&
                      (result.type !== 'boolean' || result.value === true);
      if (!isTruthy) {
        return result;
      }
    }
    return args.length > 0 ? interpret(args[args.length - 1], env) : { type: 'boolean', value: true };
  },

  '.': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    if (args.length < 2) {
      throw new Error('. requires at least 2 arguments');
    }

    const obj = interpret(args[0], env);
    const methodName = args[1];

    if (methodName.type !== 'symbol') {
      throw new Error('. requires a symbol as method name');
    }

    const methodArgs = args.slice(2).map(arg => {
      const evaluated = interpret(arg, env);
      return toJSValue(evaluated);
    });

    const jsObj = toJSValue(obj);

    if (obj && typeof obj === 'object' && obj.__nodejs_context__ && obj.__original_object__) {
      const originalObj = obj.__original_object__;
      const method = (originalObj as Record<string, any>)[methodName.value];
      if (typeof method === 'function') {
        if (methodName.value === 'listen') {
          if (methodArgs.length > 0) {
            const lastArg = args[args.length - 1];
            if (lastArg.type === 'function') {
              methodArgs[methodArgs.length - 1] = (...cbArgs: any[]) => lastArg.value();
            } else if (lastArg.type === 'closure') {
              methodArgs[methodArgs.length - 1] = (...cbArgs: any[]) => callFunction(lastArg, [], env, nsManager);
            }
          }
          try {
            const result = originalObj.listen(...methodArgs);
            return jsonToHcValue(result);
          } catch (err) {
            throw err;
          }
        }
        try {
          const boundMethod = method.bind(originalObj);
          return jsonToHcValue(boundMethod(...methodArgs));
        } catch (err) {
          if (methodName.value === 'listen' && methodArgs.length > 0) {
            const argsNoCallback = methodArgs.slice(0, -1);
            const boundMethod = method.bind(originalObj);
            return jsonToHcValue(boundMethod(...argsNoCallback));
          }
          throw err;
        }
      }
    }

    if (jsObj && typeof jsObj === 'object' && methodName.value in jsObj) {
      const method = (jsObj as Record<string, any>)[methodName.value];
      if (typeof method === 'function') {
        if (methodName.value === 'listen' && methodArgs.length > 0) {
          const lastArg = args[args.length - 1];
          if (lastArg.type === 'function') {
            methodArgs[methodArgs.length - 1] = (...cbArgs: any[]) => lastArg.value();
          } else if (lastArg.type === 'closure') {
            methodArgs[methodArgs.length - 1] = (...cbArgs: any[]) => callFunction(lastArg, [], env, nsManager);
          }
        }
        try {
          return jsonToHcValue(method.apply(jsObj, methodArgs));
        } catch (err) {
          if (methodName.value === 'listen' && methodArgs.length > 0) {
            const argsNoCallback = methodArgs.slice(0, -1);
            return jsonToHcValue(method.apply(jsObj, argsNoCallback));
          }
          throw err;
        }
      }
    }

    throw new Error(`Method ${methodName.value} not found on object`);
  },

  '.-': (args: HCValue[], env: Environment, interpret: any, nsManager?: NamespaceManager): HCValue => {
    if (args.length !== 2) {
      throw new Error('.- requires exactly 2 arguments');
    }

    const obj = interpret(args[0], env);
    const propName = args[1];

    if (propName.type !== 'symbol') {
      throw new Error('.- requires a symbol as property name');
    }

    const jsObj = toJSValue(obj);
    if (jsObj && typeof jsObj === 'object' && propName.value in jsObj) {
      const prop = (jsObj as Record<string, any>)[propName.value];
      return jsonToHcValue(prop as JSONValue);
    }

    return { type: 'nil', value: null };
  }
};

function processImport(importClauses: HCValue[], nsManager: NamespaceManager): void {
  for (const clause of importClauses) {
    if (clause.type === 'list') {
      const packageName = clause.value[0];
      if (packageName.type === 'symbol') {
        const moduleName = packageName.value;

        if (moduleName.startsWith('node.')) {
          const alias = moduleName.split('.')[1];
          nsManager.addRequire(moduleName, alias);
        } else {
          const builtinModules = ['crypto', 'fs', 'path', 'http', 'url', 'os', 'util', 'events'];
          const finalModuleName = builtinModules.includes(moduleName) ? `node.${moduleName}` : moduleName;
          nsManager.addRequire(finalModuleName, moduleName);
        }

        for (let i = 1; i < clause.value.length; i++) {
          const functionName = clause.value[i];
          if (functionName.type === 'symbol') {
            console.log(`Importing ${packageName.value}.${functionName.value}`);
          }
        }
      }
    }
  }
}

function processRequire(requireClauses: HCValue[], nsManager: NamespaceManager): void {
  for (const clause of requireClauses) {
    if (clause.type === 'vector' && clause.value.length >= 1) {
      const namespaceName = clause.value[0];
      if (namespaceName.type === 'symbol') {
        let alias = namespaceName.value;

        for (let i = 1; i < clause.value.length; i++) {
          const item = clause.value[i];
          if (item.type === 'keyword' && item.value === 'as' && i + 1 < clause.value.length) {
            const aliasSymbol = clause.value[i + 1];
            if (aliasSymbol.type === 'symbol') {
              alias = aliasSymbol.value;
            }
            break;
          }
        }

        nsManager.addRequire(namespaceName.value, alias);
      }
    }
  }
}
