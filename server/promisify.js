export default function promisify(objOrFunction, methodName) {
  const func = methodName ?
    objOrFunction[methodName].bind(objOrFunction) :
    objOrFunction;

  return function(...args) {
    return new Promise((resolve, reject) => {
      func(...args, function(err, result) {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  };
}