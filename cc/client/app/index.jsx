import '../scss/App.scss';

import React, { StrictMode } from "react";
import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux";
// import { ConnectedRouter } from "connected-react-router";
import { IntlProvider } from "react-intl";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import * as Sentry from "@sentry/react";
import { captureConsoleIntegration, httpClientIntegration } from "@sentry/integrations";

import Application from './application';
import { store } from './store';
import { EntitiesLoader } from './entity';
import CookiePolicy from './component/cookieConsent';
import CookieAndPrivacyPolicy from './component/privacyPolicy';


// require('default-passive-events');

// if (import.meta.env.MODE !== "development") {
// Sentry.init({
//   dsn: "https://f2b6fefc4dbbceb9b6befee7b122ff99@o4506026617864192.ingest.sentry.io/4506026878959616",
//   integrations: [
//     Sentry.browserTracingIntegration({
//       // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
//       tracePropagationTargets: [import.meta.env.VITE_CC_URL_TEACH, import.meta.env.VITE_CC_URL_LEARN, import.meta.env.VITE_CC_URL_RESEARCH],
//     }),
//     Sentry.replayIntegration(),
// 		captureConsoleIntegration(),
// 		httpClientIntegration()	
//   ],
//   // Performance Monitoring
//   tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
//   // Session Replay
//   replaysSessionSampleRate: 0.3, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
//   replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.

// 	sendDefaultPii: true,
// });
// }

// Start all model Entities
EntitiesLoader.init();

const App = React.lazy(() => import('./containers/App'));

// document.getElementById('mainspinner').style.display = 'none';
// document.getElementById('app').style.display = '';

const ENVIRONMENT = import.meta.env.MODE;
console.log(`CC Config
Build Date | ${import.meta.env.VITE_CC_SPA_BUILD_DATETIME}
Version    | v${import.meta.env.VITE_CC_VERSION}-${import.meta.env.VITE_CC_GIT_BRANCH} (${import.meta.env.VITE_CC_GIT_COMMIT})
Mode       | ${import.meta.env.MODE}
Domain     | ${Application.getSubdomain()}
`);

const IS_DEVELOPMENT = ENVIRONMENT == "development";

// if ( IS_DEVELOPMENT ) {
//   const Immutable = require('immutable');
//   const immutableDevTools = require('immutable-devtools');

//   immutableDevTools(Immutable);
// }

const DEFAULT_LANGUAGE_CODE = 'en';

const getMessages = code => {
  try {
    return require(`./locales/${code}.json`);
  } catch (e) {
    console.warn(`Error on loading ./locales/${code}.json, ` + e);
    return null;
  }
};

const getMessagesAndLanguageCode = () => {
	const messages = getMessages(Application.languageCode) || getMessages(Application.language);
	if (messages) { 
		return { languageCode: Application.languageCode , messages: messages}
	}
	return { languageCode: DEFAULT_LANGUAGE_CODE, messages: getMessages(DEFAULT_LANGUAGE_CODE) };
}

const { languageCode, messages } = getMessagesAndLanguageCode();


// Create a client
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<IntlProvider key={languageCode} locale={languageCode} messages={messages}>
						<React.Suspense fallback={(<div>Loading...</div>)}>
						<CookieAndPrivacyPolicy />
						<CookiePolicy />
							<App />
						</React.Suspense>
				</IntlProvider>
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
    </Provider>
  </StrictMode>,
)