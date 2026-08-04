import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

export function TextInput({ label, defaultValue = '', onSubmit, placeholder }) {
  const [value, setValue] = useState(defaultValue);
  const [cursorPos, setCursorPos] = useState(defaultValue.length);

  useInput((input, key) => {
    if (key.return) {
      onSubmit(value || defaultValue);
    } else if (key.backspace || key.delete) {
      if (cursorPos > 0) {
        setValue((v) => v.slice(0, cursorPos - 1) + v.slice(cursorPos));
        setCursorPos((p) => p - 1);
      }
    } else if (key.leftArrow) {
      setCursorPos((p) => Math.max(0, p - 1));
    } else if (key.rightArrow) {
      setCursorPos((p) => Math.min(value.length, p + 1));
    } else if (input && !key.ctrl && !key.meta) {
      setValue((v) => v.slice(0, cursorPos) + input + v.slice(cursorPos));
      setCursorPos((p) => p + input.length);
    }
  });

  const displayValue = value || placeholder || '';
  const before = displayValue.slice(0, cursorPos);
  const cursor = displayValue[cursorPos] || ' ';
  const after = displayValue.slice(cursorPos + 1);

  return React.createElement(
    Box,
    { flexDirection: 'column', marginBottom: 1 },
    React.createElement(
      Box,
      { marginBottom: 1 },
      React.createElement(Text, { color: '#646cff', bold: true }, label)
    ),
    React.createElement(
      Box,
      { paddingLeft: 2 },
      React.createElement(Text, null, before),
      React.createElement(Text, { inverse: true, color: '#646cff' }, cursor),
      React.createElement(Text, null, after)
    ),
    React.createElement(
      Box,
      { marginTop: 1, paddingLeft: 2 },
      React.createElement(Text, { color: 'gray', dimColor: true }, 'enter confirm • ←→ move cursor')
    )
  );
}
