const cluster = require('cluster');
const numCpus = require('os').cpus().length;

if (cluster.isMaster) {
  let i = 0;
  while (i < numCpus) {
    cluster.fork();
    i++;
  }
  cluster.on('exit', (worker, code, signal) => {
    console.error('worker ' + worker.process.pid + ' died', true);
    cluster.fork();
  });
} else {
  require('./index');
}
