import { parenthesize } from '../src/Parenthesize';

describe('Parenthesize', () => {
  describe('Basic functionality', () => {
    test('should handle empty tokens', () => {
      const result = parenthesize([]);
      expect(result).toEqual({ type: 'list', value: [] });
    });

    test('should handle single token', () => {
      const result = parenthesize(['42']);
      expect(result).toEqual({ type: 'number', value: 42 });
    });

    test('should handle simple list', () => {
      const result = parenthesize(['(', '1', '2', '3', ')']);
      expect(result).toEqual({
        type: 'list',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      });
    });
  });

  describe('Object parsing', () => {
    test('should parse empty object', () => {
      const result = parenthesize(['{', '}']);
      expect(result).toEqual({ type: 'object', value: {} });
    });

    test('should parse simple object with symbol key-value pairs', () => {
      const result = parenthesize(['{', 'name', '"John"', 'age', '30', '}']);
      expect(result).toEqual({
        type: 'object',
        value: {
          name: { type: 'string', value: 'John' },
          age: { type: 'number', value: 30 }
        }
      });
    });

    test('should parse object with keyword keys', () => {
      const result = parenthesize(['{', ':name', '"John"', ':age', '30', '}']);
      expect(result).toEqual({
        type: 'object',
        value: {
          name: { type: 'string', value: 'John' },
          age: { type: 'number', value: 30 }
        }
      });
    });

    test('should handle object with simple values', () => {
      const result = parenthesize(['{', 'a', '1', 'b', '2', '}']);
      expect(result).toEqual({
        type: 'object',
        value: {
          a: { type: 'number', value: 1 },
          b: { type: 'number', value: 2 }
        }
      });
    });

    test('should handle incomplete object - missing value token', () => {
      const result = parenthesize(['{', 'name', '}']);

      expect(result).toEqual({
        type: 'object',
        value: {
          name: { type: 'symbol', value: '}' }
        }
      });
    });

    test('should handle incomplete object - no closing brace', () => {
      const result = parenthesize(['{', 'name', 'value']);
      expect(result).toEqual({
        type: 'object',
        value: {
          name: { type: 'symbol', value: 'value' }
        }
      });
    });

    test('should handle object with keyToken undefined break condition', () => {
      const result = parenthesize(['{']);
      expect(result).toEqual({
        type: 'object',
        value: {}
      });
    });

    test('should handle object with no tokens after key', () => {
      const tokens = ['{', 'key'];
      const result = parenthesize(tokens);
      expect(result).toEqual({
        type: 'object',
        value: {}
      });
    });

    test('should handle object with valueToken undefined', () => {
      const result = parenthesize(['{', 'key', 'value']);
      expect(result).toEqual({
        type: 'object',
        value: {
          key: { type: 'symbol', value: 'value' }
        }
      });
    });

    test('should handle object with non-nested token values', () => {
      const result = parenthesize(['{', 'simple', 'token', '}']);
      expect(result).toEqual({
        type: 'object',
        value: {
          simple: { type: 'symbol', value: 'token' }
        }
      });
    });

    test('should handle object with closing brace removal', () => {
      const result = parenthesize(['{', 'key', 'value', '}', 'extra']);
      expect(result).toEqual({
        type: 'list',
        value: [
          {
            type: 'object',
            value: {
              key: { type: 'symbol', value: 'value' }
            }
          },
          { type: 'symbol', value: 'extra' }
        ]
      });
    });
  });

  describe('Other parenthesize functionality', () => {
    test('should handle vectors', () => {
      const result = parenthesize(['[', '1', '2', '3', ']']);
      expect(result).toEqual({
        type: 'vector',
        value: [
          { type: 'number', value: 1 },
          { type: 'number', value: 2 },
          { type: 'number', value: 3 }
        ]
      });
    });

    test('should handle quoted expressions', () => {
      const result = parenthesize(['\'', 'symbol']);
      expect(result).toEqual({
        type: 'list',
        value: [
          { type: 'symbol', value: 'quote' },
          { type: 'symbol', value: 'symbol' }
        ]
      });
    });

    test('should handle nested structures', () => {
      const result = parenthesize(['(', 'list', '[', '1', '2', ']', '{', 'a', '1', '}', ')']);
      expect(result).toEqual({
        type: 'list',
        value: [
          { type: 'symbol', value: 'list' },
          {
            type: 'vector',
            value: [
              { type: 'number', value: 1 },
              { type: 'number', value: 2 }
            ]
          },
          {
            type: 'object',
            value: {
              a: { type: 'number', value: 1 }
            }
          }
        ]
      });
    });

    test('should handle object in a list context', () => {
      const result = parenthesize(['(', 'data', '{', 'x', '1', 'y', '2', '}', ')']);
      expect(result).toEqual({
        type: 'list',
        value: [
          { type: 'symbol', value: 'data' },
          {
            type: 'object',
            value: {
              x: { type: 'number', value: 1 },
              y: { type: 'number', value: 2 }
            }
          }
        ]
      });
    });
  });
});
