const express = require('express');
const { Worker } = require('worker_threads');
const path = require('path');

const app = express();
const port = 5023;
const JSONBODY_SIZE_LIMIT = '40mb';

// Generic helper to run a worker with a timeout
function runWorker(workerPath, workerData, timeoutMs, res) {
  const worker = new Worker(workerPath, { workerData });
  const timeout = setTimeout(() => {
    worker.terminate();
    res.status(503).json({ error: 'Processing timed out' });
  }, timeoutMs);

  worker.on('message', (msg) => {
    clearTimeout(timeout);
    if (msg.error) {
      res.status(400).json({ error: msg.error });
    } else {
      res.status(200).json({ data: msg.result });
    }
  });

  worker.on('error', (err) => {
    clearTimeout(timeout);
    console.error('Worker error:', err);
    res.status(500).json({ error: 'Internal worker error' });
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);
    }
  });
}

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json({ limit: JSONBODY_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSONBODY_SIZE_LIMIT }));

// Request logger
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('JSON body limit:', JSONBODY_SIZE_LIMIT);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ data: 'CC Boolean Analysis API' });
});

// /regulator endpoint
app.post('/regulator', (req, res) => {
  const { expr } = req.body;
	runWorker(
    path.join(__dirname, 'regulatorWorker.js'),
    { expr },
    15000,
    res
  );

});

// /compare endpoint
app.post('/compare', (req, res) => {
  const { expr1, expr2 } = req.body;
	runWorker(
    path.join(__dirname, 'compareWorker.js'),
    { expr1, expr2 },
    15000,
    res
  );
});


app.use((err, req, res, next) => {
	console.log(`Incoming ${req.method} request to ${req.url}`);
  if (err.type === 'entity.too.large') {
    console.error('PayloadTooLargeError:', err.message);
    return res.status(413).json({ error: 'Payload too large' });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
