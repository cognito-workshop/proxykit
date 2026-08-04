const c = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  red:     '\x1b[31m',
  green:   '\x1b[32m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  cyan:    '\x1b[36m',
};

export const bold   = (s) => `${c.bold}${s}${c.reset}`;
export const dim    = (s) => `${c.dim}${s}${c.reset}`;
export const red    = (s) => `${c.red}${s}${c.reset}`;
export const green  = (s) => `${c.green}${s}${c.reset}`;
export const yellow = (s) => `${c.yellow}${s}${c.reset}`;
export const blue   = (s) => `${c.blue}${s}${c.reset}`;
export const cyan   = (s) => `${c.cyan}${s}${c.reset}`;
