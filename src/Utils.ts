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
  case 'function':
    return value.value;
  case 'object':
    if ((value as any).__nodejs_context__ && (value as any).__original_object__) {
      return (value as any).__original_object__;
    }
    if (value.value && typeof value.value === 'object' && value.value.constructor && value.value.constructor.name === 'Server') {
      return value.value;
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
    return { type: 'object', value: json };
  }
  return { type: 'string', value: String(json) };
}
