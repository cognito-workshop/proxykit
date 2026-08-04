import React from 'react';
import { Box, Text } from 'ink';

export function ProgressBar({ current, total, label }) {
  const progress = current / total;
  const barWidth = 30;
  const filled = Math.round(barWidth * progress);
  const empty = barWidth - filled;

  return React.createElement(
    Box,
    { flexDirection: 'column', marginBottom: 1 },
    label && React.createElement(
      Box,
      { marginBottom: 1 },
      React.createElement(Text, { color: 'gray' }, `${label} (${current}/${total})`)
    ),
    React.createElement(
      Box,
      { paddingLeft: 2 },
      React.createElement(Text, { color: '#646cff' }, '█'.repeat(filled)),
      React.createElement(Text, { color: 'gray' }, '░'.repeat(empty)),
      React.createElement(Text, { color: 'gray' }, ` ${Math.round(progress * 100)}%`)
    )
  );
}
