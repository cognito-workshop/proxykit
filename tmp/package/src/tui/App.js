import React, { useState, useCallback } from 'react';
import { Box, Text } from 'ink';
import { Header } from './components/Header.js';
import { StepSelector } from './components/StepSelector.js';
import { TextInput } from './components/TextInput.js';
import { ProgressBar } from './components/ProgressBar.js';
import { ThemePreview } from './components/ThemePreview.js';
import { ConfirmScreen } from './components/ConfirmScreen.js';
import { GeneratingScreen } from './components/GeneratingScreen.js';
import { DoneScreen } from './components/DoneScreen.js';
import { getRecommendedTransport, getRecommendedDeployment } from '../lib/validate.js';
import { detectPackageManager } from '../lib/package-manager.js';
import { collectFiles } from '../generator.js';

const STEPS = [
  { id: 'name', label: 'Project Name' },
  { id: 'engine', label: 'Proxy Engine' },
  { id: 'transport', label: 'Transport' },
  { id: 'mux', label: 'Mux Layer' },
  { id: 'deployment', label: 'Deployment Target' },
  { id: 'template', label: 'Template' },
  { id: 'theme', label: 'Theme' },
  { id: 'git', label: 'Git Init' },
  { id: 'confirm', label: 'Confirm' },
];

const ENGINE_OPTIONS = [
  { value: 'ultraviolet', label: 'Ultraviolet', shortcut: '1', description: 'service worker, most features' },
  { value: 'scramjet', label: 'Scramjet', shortcut: '2', description: 'service worker, obfuscation' },
  { value: 'rammerhead', label: 'Rammerhead', shortcut: '3', description: 'session-based routing' },
];

const TRANSPORT_OPTIONS = [
  { value: 'wisp', label: 'Wisp', shortcut: '1', description: 'WebSocket, needs server' },
  { value: 'bare', label: 'Bare', shortcut: '2', description: 'browser WebSocket adapter' },
  { value: 'epoxy', label: 'Epoxy', shortcut: '3', description: 'WASM-based TLS' },
  { value: 'direct', label: 'Direct', shortcut: '4', description: 'simple HTTP proxy' },
];

const MUX_OPTIONS = [
  { value: 'baremux', label: 'BareMux', shortcut: '1', description: 'multiplexed connections' },
  { value: 'none', label: 'None', shortcut: '2', description: 'no mux' },
];

const DEPLOYMENT_OPTIONS = [
  { value: 'docker-caddy', label: 'Docker + Caddy', shortcut: '1', description: 'reverse proxy' },
  { value: 'docker-nginx', label: 'Docker + Nginx', shortcut: '2', description: 'reverse proxy' },
  { value: 'cloudflare-pages', label: 'Cloudflare Pages', shortcut: '3', description: 'edge workers' },
  { value: 'vercel', label: 'Vercel', shortcut: '4', description: 'serverless' },
  { value: 'static', label: 'Static', shortcut: '5', description: 'any static host' },
];

const TEMPLATE_OPTIONS = [
  { value: 'minimal', label: 'Minimal', shortcut: '1', description: 'essentials only' },
  { value: 'full', label: 'Full', shortcut: '2', description: 'landing page, settings, analytics' },
  { value: 'cognito', label: 'Cognito', shortcut: '3', description: 'Relay integration' },
];

const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark', shortcut: '1' },
  { value: 'midnight', label: 'Midnight', shortcut: '2' },
  { value: 'forest', label: 'Forest', shortcut: '3' },
  { value: 'sunset', label: 'Sunset', shortcut: '4' },
  { value: 'ocean', label: 'Ocean', shortcut: '5' },
  { value: 'light', label: 'Light', shortcut: '6' },
];

const GIT_OPTIONS = [
  { value: true, label: 'Yes', shortcut: '1' },
  { value: false, label: 'No', shortcut: '2' },
];

export function App({ options = {} }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    name: options.name || '',
    engine: options.engine || null,
    transport: options.transport || null,
    mux: options.mux || null,
    deployment: options.deployment || null,
    template: options.template || null,
    theme: options.theme || null,
    git: options.git !== undefined ? options.git : null,
  });
  const [files, setFiles] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const config = {
    proxy: {
      engine: answers.engine,
      transport: answers.transport,
      mux: answers.mux === 'none' ? null : answers.mux,
      prefix: '/service/',
      bare: '/bare/',
      relay: '/v1/connect',
    },
    server: { port: 8080, hostname: 'localhost' },
    deployment: answers.deployment,
    template: answers.template,
    theme: answers.theme,
  };

  const handleComplete = useCallback(async () => {
    const fileList = await collectFiles(answers.name, config, answers.template);
    setFiles(fileList.map((f) => f.path));
    setGenerating(true);
  }, [answers.name, config, answers.template]);

  const handleGeneratingComplete = useCallback(async () => {
    setGenerating(false);
    setDone(true);

    const { generateProject } = await import('../generator.js');
    await generateProject(answers.name, config, answers.template);

    if (answers.git) {
      const { execSync } = await import('node:child_process');
      try {
        execSync('git init', { cwd: answers.name, stdio: 'ignore' });
        execSync('git add -A', { cwd: answers.name, stdio: 'ignore' });
        execSync('git commit -m "Initial commit from proxykit"', { cwd: answers.name, stdio: 'ignore' });
      } catch {}
    }
  }, [answers, config]);

  if (done) {
    const pkgManager = detectPackageManager();
    return DoneScreen({ name: answers.name, packageManager: pkgManager });
  }

  if (generating) {
    return GeneratingScreen({ files, onComplete: handleGeneratingComplete });
  }

  const stepConfig = STEPS[step];

  const handleNext = (value) => {
    setAnswers((prev) => ({ ...prev, [stepConfig.id]: value }));
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const children = [];

  children.push(Header());
  children.push(ProgressBar({ current: step + 1, total: STEPS.length, label: stepConfig.label }));

  if (stepConfig.id === 'name') {
    children.push(TextInput({
      label: 'Project name',
      defaultValue: answers.name || 'my-proxy',
      placeholder: 'my-proxy',
      onSubmit: handleNext,
    }));
  } else if (stepConfig.id === 'engine') {
    children.push(StepSelector({
      title: 'Proxy engine',
      options: ENGINE_OPTIONS,
      recommended: 'ultraviolet',
      onSelect: handleNext,
    }));
  } else if (stepConfig.id === 'transport') {
    children.push(StepSelector({
      title: 'Transport',
      options: TRANSPORT_OPTIONS,
      recommended: getRecommendedTransport(answers.engine),
      onSelect: handleNext,
    }));
  } else if (stepConfig.id === 'mux') {
    children.push(StepSelector({
      title: 'Mux layer',
      options: MUX_OPTIONS,
      recommended: 'baremux',
      onSelect: handleNext,
    }));
  } else if (stepConfig.id === 'deployment') {
    children.push(StepSelector({
      title: 'Deployment target',
      options: DEPLOYMENT_OPTIONS,
      recommended: getRecommendedDeployment(answers.transport),
      onSelect: handleNext,
    }));
  } else if (stepConfig.id === 'template') {
    children.push(StepSelector({
      title: 'Template',
      options: TEMPLATE_OPTIONS,
      onSelect: handleNext,
    }));
  } else if (stepConfig.id === 'theme') {
    children.push(StepSelector({
      title: 'Theme',
      options: THEME_OPTIONS,
      recommended: 'dark',
      onSelect: handleNext,
    }));
    children.push(ThemePreview({ selectedTheme: answers.theme || 'dark' }));
  } else if (stepConfig.id === 'git') {
    children.push(StepSelector({
      title: 'Initialize git repo?',
      options: GIT_OPTIONS,
      onSelect: handleNext,
    }));
  } else if (stepConfig.id === 'confirm') {
    children.push(ConfirmScreen({
      config: { name: answers.name, ...config, git: answers.git },
      onConfirm: handleComplete,
      onCancel: () => setStep(0),
    }));
  }

  if (step > 0 && stepConfig.id !== 'confirm') {
    children.push(React.createElement(Box, { paddingLeft: 2, marginTop: 1 },
      React.createElement(Text, { color: 'gray', dimColor: true }, '← back (esc)')
    ));
  }

  return React.createElement(Box, { flexDirection: 'column' }, ...children);
}
