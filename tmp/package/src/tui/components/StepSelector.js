import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

export function StepSelector({ title, options, description, onSelect, recommended }) {
  const defaultIndex = recommended ? options.findIndex((o) => o.value === recommended) : 0;
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex >= 0 ? defaultIndex : 0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex((i) => (i === 0 ? options.length - 1 : i - 1));
    } else if (key.downArrow) {
      setSelectedIndex((i) => (i === options.length - 1 ? 0 : i + 1));
    } else if (key.return) {
      onSelect(options[selectedIndex].value);
    }
  });

  return React.createElement(
    Box,
    { flexDirection: 'column', marginBottom: 1 },
    React.createElement(
      Box,
      { marginBottom: 1 },
      React.createElement(Text, { color: '#646cff', bold: true }, title),
      recommended && React.createElement(Text, { color: 'gray' }, ` (recommended: ${recommended})`)
    ),
    React.createElement(
      Box,
      { flexDirection: 'column', paddingLeft: 2 },
      ...options.map((option, index) => {
        const isSelected = index === selectedIndex;
        const isRecommended = option.value === recommended;
        return React.createElement(
          Box,
          { key: option.value },
          React.createElement(Text, { color: isSelected ? '#646cff' : undefined, bold: isSelected, inverse: isSelected }, isSelected ? ' ● ' : ' ○ '),
          React.createElement(Text, { color: isSelected ? '#646cff' : undefined, bold: isSelected || isRecommended }, option.label),
          option.shortcut && React.createElement(Text, { color: 'gray' }, ` (${option.shortcut})`),
          isRecommended && !isSelected && React.createElement(Text, { color: 'green' }, ' ★'),
          option.description && React.createElement(Text, { color: 'gray' }, ` - ${option.description}`)
        );
      })
    ),
    React.createElement(
      Box,
      { marginTop: 1, paddingLeft: 2 },
      React.createElement(Text, { color: 'gray', dimColor: true }, '↑↓ navigate • enter select')
    )
  );
}
