export const createKey = (...args: (string | undefined | null | object)[]) => {
  return args
    .flatMap((arg) => {
      if (Array.isArray(arg)) return arg;
      if (typeof arg === "object" && arg !== null) {
        return Object.entries(arg).map(([key, value]) => `${key}:${value}`);
      }
      return arg;
    })
    .filter((arg): arg is string => arg !== undefined && arg !== null);
};
