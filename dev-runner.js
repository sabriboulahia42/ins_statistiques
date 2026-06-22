const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let child = null;
let restartTimer = null;

function startServer() {
  if (child) {
    console.log('\x1b[33m%s\x1b[0m', ' [Super-Nodemon] ↻ Restarting server...');
    child.kill('SIGTERM');
    // On Windows, sometimes the process needs a moment to release the port
  }
  
  // Spawn the actual proxy server
  child = spawn('node', ['proxy.js'], { stdio: ['inherit', 'inherit', 'pipe'] });
  
  child.stderr.on('data', (data) => {
    const msg = data.toString();
    process.stderr.write(msg); // Still show the raw error

    if (msg.includes('EACCES')) {
      console.error('\x1b[31m%s\x1b[0m', ' [Super-Nodemon] ✗ ERROR: Permission Denied. Try a port > 1024 or run as Administrator.');
    } else if (msg.includes('EADDRINUSE')) {
      console.error('\x1b[31m%s\x1b[0m', ' [Super-Nodemon] ✗ ERROR: Port already in use. Try killing existing node processes.');
    }
  });

  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
       console.log('\x1b[33m%s\x1b[0m', ` [Super-Nodemon] ℹ Server stopped.`);
    }
  });

  child.on('error', (err) => {
    console.error('\x1b[31m%s\x1b[0m', ` [Super-Nodemon] ✗ Failed to start server: ${err.message}`);
  });
}

// Watch for file changes
fs.watch(__dirname, { recursive: true }, (event, filename) => {
  if (filename && filename.endsWith('.js') && !filename.includes('node_modules') && !filename.startsWith('.')) {
    // Debounce restarts
    if (restartTimer) clearTimeout(restartTimer);
    restartTimer = setTimeout(() => {
      console.log('\x1b[36m%s\x1b[0m', ` [Super-Nodemon] 👁 Change detected in ${filename}`);
      startServer();
    }, 200);
  }
});

console.log('\x1b[32m%s\x1b[0m', ' [Super-Nodemon] 👁 Watching for changes...');
startServer();
