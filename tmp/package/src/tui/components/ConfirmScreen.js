import React from 'react';
import { Box, Text, useInput } from 'ink';

export function ConfirmScreen({ config, onConfirm, onCancel }) {
  useInput((input, key) => {
    if (key.return || input === 'y' || input === 'Y') {
      onConfirm();
    } else if (input === 'n' || input === 'N' || key.escape) {
      onCancel();
    }
  });

  return React.createElement(
    Box,
    { flexDirection: 'column', marginBottom: 1 },
    React.createElement(
      Box,
      { marginBottom: 1 },
      React.createElement(Text, { color: '#646cff', bold: true }, 'Confirm Configuration')
    ),
    React.createElement(
      Box,
      { flexDirection: 'column', borderStyle: 'round', borderColor: 'gray', padding: 1 },
      React.createElement(Box, null, React.createElement(Text, { color: 'gray' }, 'Project: '), React.createElement(Text, { bold: true }, config.name)),
      React.createElement(Box, null, React.createElement(Text, { color: 'gray' }, 'Engine: '), React.createElement(Text, { color: '#646cff' }, config.engine)),
      React.createElement(Box, null, React.createElement(Text, { color: 'gray' }, 'Transport: '), React.createElement(Text, { color: '#646cff' }, config.transport)),
      React.createElement(Box, null, React.createElement(Text, { color: 'gray' }, 'Mux: '), React.createElement(Text, { color: '#646cff' }, config.mux || 'none')),
      React.createElement(Box, null, React.createElement(Text, { color: 'gray' }, 'Deployment: '), React.createElement(Text, { color: '#646cff' }, config.deployment)),
      React.createElement(Box, null, React.createElement(Text, { color: 'gray' }, 'Template: '), React.createElement(Text, { color: '#646cff' }, config.template)),
      React.createElement(Box, null, React.createElement(Text, { color: 'gray' }, 'Theme: '), React.createElement(Text, { color: '#646cff' }, config.theme)),
      React.createElement(Box, null, React.createElement(Text, { color: 'gray' }, 'Git: '), React.createElement(Text, { color: '#646cff' }, config.git ? 'yes' : 'no'))
    ),
    React.createElement(
      Box,
      { marginTop: 1, paddingLeft: 2 },
      React.createElement(Text, { color: 'gray', dimColor: true }, 'enter/y confirm • n/esc cancel')
    )
  );
}
