const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite on web loads its bundled SQLite WebAssembly asset.
config.resolver.assetExts.push('wasm');

module.exports = config;
