const { parentPort, workerData } = require('worker_threads');
const ccBooleanAnalysis = require('./ccBooleanAnalysis');

try {
  const { expr } = workerData;
  const result = ccBooleanAnalysis.getBiologicalConstructs(expr);
  parentPort.postMessage({ result });
} catch (err) {
  parentPort.postMessage({ error: err.message });
}
