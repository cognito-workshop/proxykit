import React from 'react';
import { Box, Text } from 'ink';

function buildTree(files) {
  const root = {};
  for (const file of files) {
    const parts = file.path.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = null;
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    }
  }
  return root;
}

function TreeView({ tree, prefix = '' }) {
  const entries = Object.entries(tree);
  const lines = [];
  entries.forEach(([name, children], index) => {
    const last = index === entries.length - 1;
    const connector = last ? '└── ' : '├── ';
    const isFile = children === null;
    lines.push(
      React.createElement(
        Box,
        { key: name, paddingLeft: 2 },
        React.createElement(Text, { color: 'gray' }, `${prefix}${connector}`),
        React.createElement(Text, { color: isFile ? undefined : '#646cff' }, isFile ? `📄 ${name}` : `📁 ${name}`)
      )
    );
    if (!isFile) {
      const newPrefix = prefix + (last ? '    ' : '│   ');
      const childLines = TreeView({ tree: children, prefix: newPrefix });
      lines.push(...childLines);
    }
  });
  return lines;
}

export function FileTree({ files, title }) {
  const tree = buildTree(files);
  return React.createElement(
    Box,
    { flexDirection: 'column', marginBottom: 1 },
    title && React.createElement(
      Box,
      { marginBottom: 1 },
      React.createElement(Text, { color: '#646cff', bold: true }, title),
      React.createElement(Text, { color: 'gray' }, ` (${files.length} files)`)
    ),
    ...TreeView({ tree })
  );
}
