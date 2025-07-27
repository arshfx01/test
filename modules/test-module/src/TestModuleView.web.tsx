import * as React from 'react';

import { TestModuleViewProps } from './TestModule.types';

export default function TestModuleView(props: TestModuleViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
