const { difference } = require('ramda');

// eslint-disable-next-line no-magic-numbers
const cool = difference([2, 4, 5], [5]);

console.log('cool', cool);
