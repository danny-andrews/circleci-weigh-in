import R from 'ramda';

export const PromiseError = R.pipe(Error, a => Promise.reject(a));

export const FakeRequest = (handlers = []) => (...args) => {
  const [url] = args;
  const handler = handlers.find(({matcher}) => {
    const type = R.type(matcher);
    switch(type) {
    case 'Function':
      return matcher(...args);
    case 'RegExp':
      return url.match(matcher);
    default:
      throw new Error(`Unsupported handler type: ${type}`);
    }
  });
  if(!handler) {
    throw new Error(`No response for ${args.join(' ')}`);
  }
  const {response} = handler;

  return R.type(response) === 'Function'
    ? Promise.resolve(response(...args))
    : Promise.resolve(response);
};
