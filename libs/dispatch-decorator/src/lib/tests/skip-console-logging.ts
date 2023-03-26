/// <reference types="jest" />

function createFn() {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return () => {};
}

export function skipConsoleLogging<T extends (...args: any[]) => any>(fn: T): ReturnType<T> {
  const consoleSpies = [
    jest.spyOn(console, 'log').mockImplementation(createFn()),
    jest.spyOn(console, 'warn').mockImplementation(createFn()),
    jest.spyOn(console, 'error').mockImplementation(createFn()),
    jest.spyOn(console, 'info').mockImplementation(createFn())
  ];
  function restoreSpies() {
    consoleSpies.forEach(spy => spy.mockRestore());
  }
  let restoreSpyAsync = false;
  try {
    const returnValue = fn();
    if (returnValue instanceof Promise) {
      restoreSpyAsync = true;
      return returnValue.finally(() => restoreSpies()) as ReturnType<T>;
    }
    return returnValue;
  } finally {
    if (!restoreSpyAsync) {
      restoreSpies();
    }
  }
}
