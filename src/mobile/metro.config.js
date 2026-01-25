const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add the parent src directory to watchFolders so Metro can watch common files
config.watchFolders = [
  path.resolve(__dirname, '..'),
];

// Configure resolver to handle paths outside the mobile directory
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

module.exports = config;
