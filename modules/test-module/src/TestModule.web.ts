import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './TestModule.types';

type TestModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class TestModule extends NativeModule<TestModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(TestModule, 'TestModule');
