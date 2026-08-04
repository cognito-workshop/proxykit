import React from 'react';
import { Box, Text } from 'ink';

const LOGO = `██████╗ ██╗   ██╗██╗██████╗ ███████╗
██╔══██╗╚██╗ ██╔╝██║██╔══██╗██╔════╝
██████╔╝ ╚████╔╝ ██║██║  ██║█████╗
██╔═══╝   ╚██╔╝  ██║██║  ██║██╔══╝
██║        ██║   ██║██████╔╝███████╗
╚═╝        ╚═╝   ╚═╝╚═════╝ ╚══════╝`;

export function Header() {
  return React.createElement(
    Box,
    { flexDirection: 'column', alignItems: 'center', marginBottom: 1 },
    React.createElement(Text, { color: '#646cff', bold: true }, LOGO),
    React.createElement(Text, { color: 'gray', italic: true }, ' scaffold production-ready web proxies')
  );
}
