// Audit-only preload. Domain suites still execute their original assertions.
// Disables only native notification integration unavailable in Node. This is not a production fix.
const Module = require('node:module');
const originalLoad = Module._load;
Module._load = function (id, parent, ...args) {
  if (id === 'react-native') return { Platform: { OS: 'web' } };
  if (id === 'expo') return { requireOptionalNativeModule: () => null };
  return originalLoad.call(this, id, parent, ...args);
};
