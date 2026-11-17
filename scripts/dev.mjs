import { spawn } from 'node:child_process';

const python = process.env.PYTHON_BIN || 'python3';
const children = [
  spawn(python, ['-m', 'uvicorn', 'backend.include_server:app', '--port', '8000'], { stdio: 'inherit' }),
  spawn('npm', ['run', 'dev:frontend'], { stdio: 'inherit', shell: process.platform === 'win32' }),
];

let shuttingDown = false;
const shutdown = (code = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  children.forEach((child) => child.kill('SIGTERM'));
  setTimeout(() => process.exit(code), 500);
};

children.forEach((child) => child.on('error', () => shutdown(1)));
process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
