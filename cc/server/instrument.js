import * as Sentry from "@sentry/node";
// import { nodeProfilingIntegration } from '@sentry/profiling-node';

// // Ensure to call this before importing any other modules!
// Sentry.init({
//   dsn: "https://f2b6fefc4dbbceb9b6befee7b122ff99@o4506026617864192.ingest.sentry.io/4506026878959616",
//   integrations: [
//     // Add our Profiling integration
//     nodeProfilingIntegration(),
//   ],

//   // Add Tracing by setting tracesSampleRate
//   tracesSampleRate: 1.0,

//   // Set sampling rate for profiling
//   // This is relative to tracesSampleRate
//   profilesSampleRate: 1.0,
// });