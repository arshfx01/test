// Reexport the native module. On web, it will be resolved to TestModule.web.ts
// and on native platforms to TestModule.ts
export { default } from './src/TestModule';
export { default as TestModuleView } from './src/TestModuleView';
export * from  './src/TestModule.types';
