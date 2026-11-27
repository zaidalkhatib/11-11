const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const config = getDefaultConfig(__dirname);
// Shared design tokens (API contracts are vendored under mobile/src/contracts).
config.watchFolders = [path.resolve(__dirname, "../website/packages")];
module.exports = config;
