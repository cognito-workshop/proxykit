import React from 'react';
import { Box, Text } from 'ink';

export function DoneScreen({ name, packageManager }) {
  return React.createElement(
    Box,
    { flexDirection: 'column', alignItems: 'center', marginTop: 1 },
    React.createElement(
      Box,
      { marginBottom: 1 },
      React.createElement(Text, { color: 'green', bold: true }, '✓ Project created successfully!')
    ),
    React.createElement(
      Box,
      { flexDirection: 'column', borderStyle: 'round', borderColor: 'green', padding: 1 },
      React.createElement(Text, { color: 'gray' }, 'Get started:'),
      React.createElement(Box, { marginTop: 1 }, React.createElement(Text, { color: '#646cff', bold: true }, `  cd ${name}`)),
      React.createElement(Box, null, React.createElement(Text, { color: '#646cff', bold: true }, `  ${packageManager.installCmd}`)),
      React.createElement(Box, null, React.createElement(Text, { color: '#646cff', bold: true }, `  ${packageManager.runCmd} dev`))
    )
  );
}
