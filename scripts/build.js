import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function buildCli() {
  await fs.rm(path.join(ROOT, 'dist'), { recursive: true, force: true });
  await fs.mkdir(path.join(ROOT, 'dist'), { recursive: true });

  // Build the main CLI (without TUI - TUI will be loaded at runtime)
  await build({
    entryPoints: [path.join(ROOT, 'src', 'cli.js')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: path.join(ROOT, 'dist', 'cli.js'),
    minify: true,
    sourcemap: true,
    external: [
      'ink',
      'react',
    ],
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  // Copy non-JS source files needed for generation
  const srcDir = path.join(ROOT, 'src');
  const distSrcDir = path.join(ROOT, 'dist', 'src');
  await fs.mkdir(distSrcDir, { recursive: true });

  // Copy template files that are used at runtime
  const templateDirs = ['engines', 'transports', 'deployments', 'templates', 'lib'];
  for (const dir of templateDirs) {
    const srcPath = path.join(srcDir, dir);
    const destPath = path.join(distSrcDir, dir);

    try {
      await fs.access(srcPath);
      await copyDir(srcPath, destPath);
    } catch {
      // Directory doesn't exist, skip
    }
  }

  // Copy relay files
  const relayDir = path.join(srcDir, 'relay');
  const distRelayDir = path.join(distSrcDir, 'relay');
  try {
    await fs.access(relayDir);
    await copyDir(relayDir, distRelayDir);
  } catch {
    // Directory doesn't exist, skip
  }

  // Copy TUI files
  const tuiDir = path.join(srcDir, 'tui');
  const distTuiDir = path.join(distSrcDir, 'tui');
  try {
    await fs.access(tuiDir);
    await copyDir(tuiDir, distTuiDir);
  } catch {
    // Directory doesn't exist, skip
  }

  console.log('Build complete → dist/');
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

buildCli().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
