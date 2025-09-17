import { HCValue } from './Categorize';

export type JSValue =
  | string
  | number
  | boolean
  | null
  | JSValue[]
  | Record<string, any>
  | Function
  | '<closure>';

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | readonly JSONValue[]
  | { readonly [key: string]: JSONValue };

export function toJSValue(value: HCValue): JSValue {
  switch (value.type) {
  case 'number':
  case 'string':
  case 'boolean':
    return value.value;
  case 'nil':
    return null;
  case 'symbol':
  case 'keyword':
    return value.value;
  case 'list':
  case 'vector':
    return value.value.map(toJSValue);
  case 'js-object':
    return (value as any).jsRef;
  case 'object':
    if ((value as any).__nodejs_context__ && (value as any).__original_object__) {
      return (value as any).__original_object__;
    }
    if (value.value && typeof value.value === 'object' && value.value.constructor && value.value.constructor.name === 'Server') {
      return value.value;
    }
    if (value.value && typeof value.value === 'object' && value.value.constructor && value.value.constructor.name === 'Buffer') {
      return value.value.toString();
    }
    if (value.value && typeof value.value === 'object' && value.value !== null) {
      const keys = Object.keys(value.value);
      const isBufferLike = keys.length > 0 && keys.every(key => /^\d+$/.test(key));
      if (isBufferLike) {
        const buffer = Buffer.from(Object.values(value.value) as number[]);
        return buffer.toString();
      }
    }
    if (value.value && typeof value.value === 'object' && value.value !== null) {
      if ((value.value as any).type && (value.value as any).value !== undefined) {
        if ((value.value as any).type === 'string') {
          return (value.value as any).value;
        }
        if ((value.value as any).type === 'number') {
          return (value.value as any).value;
        }
        if ((value.value as any).type === 'boolean') {
          return (value.value as any).value;
        }
      }

      if (Array.isArray(value.value)) {
        return value.value.map(toJSValue);
      }
      const jsObj: Record<string, any> = {};
      Object.entries(value.value).forEach(([key, val]) => {
        jsObj[key] = val && typeof val === 'object' && 'type' in val ? toJSValue(val as HCValue) : val;
      });
      return jsObj;
    }
    return value.value;
  case 'closure':
    return '<closure>';
  default:
    return value as JSValue;
  }
}

export function jsonToHcValue(json: JSONValue): HCValue {
  if (json === null || json === undefined) {
    return { type: 'nil', value: null };
  }
  if (typeof json === 'boolean') {
    return { type: 'boolean', value: json };
  }
  if (typeof json === 'number') {
    return { type: 'number', value: json };
  }
  if (typeof json === 'string') {
    return { type: 'string', value: json };
  }
  if (Array.isArray(json)) {
    return { type: 'vector', value: json.map(item => jsonToHcValue(item)) };
  }
  if (typeof json === 'object') {
    const hcObject: any = {};
    for (const [key, value] of Object.entries(json)) {
      hcObject[key] = value;
    }
    return { type: 'object', value: hcObject };
  }
  return { type: 'string', value: String(json) };
}
