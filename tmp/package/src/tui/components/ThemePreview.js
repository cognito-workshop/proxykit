import React from 'react';
import { Box, Text } from 'ink';

const THEMES = {
  dark: { bg: '#0f0f0f', primary: '#646cff', label: 'Dark' },
  midnight: { bg: '#0a0a1a', primary: '#7c7cff', label: 'Midnight' },
  forest: { bg: '#0a1a0a', primary: '#4caf50', label: 'Forest' },
  sunset: { bg: '#1a0a0a', primary: '#ff6b6b', label: 'Sunset' },
  ocean: { bg: '#0a0a1a', primary: '#42a5f5', label: 'Ocean' },
  light: { bg: '#ffffff', primary: '#646cff', label: 'Light' },
};

export function ThemePreview({ selectedTheme }) {
  return React.createElement(
    Box,
    { flexDirection: 'column', marginBottom: 1 },
    React.createElement(
      Box,
      { marginBottom: 1 },
      React.createElement(Text, { color: '#646cff', bold: true }, 'Theme Preview')
    ),
    React.createElement(
      Box,
      { flexDirection: 'column', borderStyle: 'round', borderColor: 'gray', padding: 1 },
      ...Object.entries(THEMES).map(([key, theme]) =>
        React.createElement(
          Box,
          { key, marginBottom: 1 },
          React.createElement(Text, { color: theme.primary, bold: key === selectedTheme, inverse: key === selectedTheme }, key === selectedTheme ? ' ● ' : ' ○ '),
          React.createElement(Text, { color: theme.primary, bold: key === selectedTheme }, theme.label),
          React.createElement(Text, { color: 'gray' }, ` ${theme.bg}`)
        )
      )
    )
  );
}
