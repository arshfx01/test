import { requireNativeView } from 'expo';
import * as React from 'react';

import { TestModuleViewProps } from './TestModule.types';

const NativeView: React.ComponentType<TestModuleViewProps> =
  requireNativeView('TestModule');

export default function TestModuleView(props: TestModuleViewProps) {
  return <NativeView {...props} />;
}
