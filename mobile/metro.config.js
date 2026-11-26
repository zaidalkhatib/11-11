const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");
const config = getDefaultConfig(__dirname);
// Read the existing platform-neutral brand source, rather than drifting copies.
config.watchFolders = [path.resolve(__dirname, "../website/packages")];
module.exports = config;
