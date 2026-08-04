import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

export function GeneratingScreen({ files, onComplete }) {
  const [visibleFiles, setVisibleFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= files.length) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => {
      setVisibleFiles((prev) => [...prev, files[currentIndex]]);
      setCurrentIndex((prev) => prev + 1);
    }, 30);
    return () => clearTimeout(timer);
  }, [currentIndex, files, onComplete]);

  return React.createElement(
    Box,
    { flexDirection: 'column', marginBottom: 1 },
    React.createElement(
      Box,
      { marginBottom: 1 },
      React.createElement(Text, { color: '#646cff', bold: true }, 'Generating Project')
    ),
    React.createElement(
      Box,
      { flexDirection: 'column' },
      ...visibleFiles.map((file) =>
        React.createElement(
          Box,
          { key: file },
          React.createElement(Text, { color: 'green' }, '  create '),
          React.createElement(Text, null, file)
        )
      )
    ),
    currentIndex < files.length && React.createElement(
      Box,
      { marginTop: 1 },
      React.createElement(Text, { color: 'gray', dimColor: true }, `... ${files.length - currentIndex} more files`)
    )
  );
}
