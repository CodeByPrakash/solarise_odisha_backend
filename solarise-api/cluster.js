import cluster from 'node:cluster';
import os from 'node:os';

const numCPUs = os.cpus().length;

if (cluster.isPrimary || cluster.isMaster) {
  console.log(`⚡ Primary cluster manager running (PID: ${process.pid})`);
  console.log(`🚀 Forking ${numCPUs} CPU worker processes...`);

  // Fork a worker process for every CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`⚠️ Worker ${worker.process.pid} exited (Code: ${code}, Signal: ${signal}). Launching replacement...`);
    cluster.fork();
  });
} else {
  // Workers share the TCP connection on port 5000
  import('./server.js');
}
