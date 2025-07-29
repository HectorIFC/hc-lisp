// Jest test setup file
// This file is executed before each test file

// Global test timeout
jest.setTimeout(10000);

// Utility function for mocking console
const createConsoleMock = () => {
  const originalLog = console.log;
  const originalError = console.error;
  const logs: string[] = [];
  const errors: string[] = [];

  console.log = jest.fn((...args) => {
    logs.push(args.join(' '));
  });

  console.error = jest.fn((...args) => {
    errors.push(args.join(' '));
  });

  return {
    logs,
    errors,
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
    }
  };
};

// Export for use in tests
export { createConsoleMock };
