const { parentPort, workerData } = require('worker_threads');
const ccBooleanAnalysis = require('./ccBooleanAnalysis');

try {
  const { expr1, expr2 } = workerData;
  const result = ccBooleanAnalysis.compareBooleansSAT(expr1, expr2);
  parentPort.postMessage({ result });
} catch (err) {
  parentPort.postMessage({ error: err.message });
}
