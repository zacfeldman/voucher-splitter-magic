const { fork } = require('child_process');

function runModule(modulePath, name) {
  const child = fork(modulePath, { stdio: 'inherit' });
  child.on('error', (err) => {
    console.error(`[${name}] error:`, err);
  });
  return child;
}

console.log('[servers] starting server.cjs and server-proxy.cjs ...');
const server = runModule('./server.cjs', 'server');
const proxy = runModule('./server-proxy.cjs', 'proxy');

let serverExited = false;
let proxyExited = false;

function tryExit() {
  if (serverExited && proxyExited) {
    process.exit(0);
  }
}

server.on('exit', (code) => {
  serverExited = true;
  console.log(`[server] exited with code ${code}`);
  if (code && code !== 0) {
    try { proxy.kill(); } catch {}
    process.exit(code);
  }
  tryExit();
});

proxy.on('exit', (code) => {
  proxyExited = true;
  console.log(`[proxy] exited with code ${code}`);
  if (code && code !== 0) {
    try { server.kill(); } catch {}
    process.exit(code);
  }
  tryExit();
});

process.on('SIGINT', () => {
  try { server.kill(); } catch {}
  try { proxy.kill(); } catch {}
  process.exit(0);
});


