const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase JS SDK loads multiple sub-packages (@firebase/auth, @firebase/app,
// @firebase/component, etc.). With Metro's exports-map resolver enabled,
// different import chains can resolve those packages to different builds
// (ESM vs RN), producing separate component registry singletons. When that
// happens, auth registers itself in one registry while the app instance lives
// in another, causing "Component auth has not been registered yet" at runtime.
//
// Disabling the exports-map resolver makes Metro fall back to the classic
// react-native / main / browser field priority, which resolves all Firebase
// packages to the same build consistently.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
