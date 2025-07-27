import { NativeModule, requireNativeModule } from 'expo';

import { TestModuleEvents } from './TestModule.types';

declare class TestModule extends NativeModule<TestModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<TestModule>('TestModule');
