export const withTimeout = (promise, timeoutMs) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => {
    reject(new Error("Operation timed out"));
  }, timeoutMs);

  promise.then((value) => {
    clearTimeout(timer);
    resolve(value);
  }).catch((error) => {
    clearTimeout(timer);
    reject(error);
  });
});
