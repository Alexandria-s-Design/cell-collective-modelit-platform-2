import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HistoryRouter as Router } from "redux-first-history/rr6";
import Root, {Dashboard} from '../Application';
import Course from '../Course';
import InstitutionalOnboarding from '../InstitutionalOnboarding';
import { history } from '../../store';
import Application from './../../application';
import Utils from './../../utils';
import store from "store";

const IS_DEVELOPMENT = import.meta.env.MODE == "development";

/**
 *	Redirects the user to the appropriate subdomain if they are accessing the defined target path (dashboard)
 *	in a production environment and the subdomain does not match the expected one.
 */
const redirectToSubdomain = (targetPath) => {
	if (!Application.domain || !targetPath) {
		return;
	}
	let hostDomain = Application.host.split(".");
	hostDomain = hostDomain.length > 1 ? hostDomain[0] : '';
	if (hostDomain.indexOf(Application.getSubdomain()) == -1) {
		let domains = {
			teaching: import.meta.env.VITE_CC_URL_TEACH,
			learning: import.meta.env.VITE_CC_URL_LEARN,
			research: import.meta.env.VITE_CC_URL_RESEARCH
		}
		window.location.href = `${domains[Application.domain]}/${targetPath}`;
	}
}

const handleShareableLink = (hashValue) => {
	if (hashValue && Utils.isGuid(hashValue)) {
		history.push(`/dashboard?modelHash=${hashValue}`);
	}
}

const buildHashRoute = () => {
	let hashes = '';
	if (location.hash) {
			hashes = [];
			const parseHash = new URLSearchParams(location.hash.substring(1));
			parseHash.forEach((value, key) => hashes.push({value, key}));
			hashes = "#"+hashes.map(hash => hash.key).join('&')
	}
	return `${hashes}`;
}

const DevFeaturesLazy = React.lazy(
	() => import("../DevFeatures")
);
const ChangeLogLazy = React.lazy(
	() => import("../ChangeLog")
);
const UITestLazy = React.lazy(
	() => import("../UITest")
);
const LandingLazy = React.lazy(() => import('../pages/Landing'));

function NotFoundPage() {
  const location = useLocation();

  return (
    <div style={{left: '0px', top: '75px', width: "100%"}}>
			<div style={{textAlign: 'center', margin: "0 auto", width: "400px"}}>
			<span style={{fontSize: "50px", fontWeight: "bold"}}>404</span>
			<h2>Page Not Found</h2>
      <h3>
        <code>{location.pathname}</code>
      </h3>
			</div>
    </div>
  );
}

const RouteRedirect = () => {
  const location = useLocation();
  useEffect(() => {
		const hashValue = location.hash.substring(1).trim();
		const domainPath = location.pathname.trim();
    const queryParams = new URLSearchParams(location.search);
    const xRoute = queryParams.get('x-route');
		const xSocialAuth = queryParams.get('auth');
    if (xRoute) {
			let hash =  buildHashRoute();
			if (xRoute === 'model-create-redirect' && hash) {
				hash = hash.replace('#','');
				hash = `?modelType=${hash}`;
			}
			return history.push(`/${xRoute}${hash}`);
    }
		if (xSocialAuth && xSocialAuth != 'anonymous-user') {
			const loginType = queryParams.get('type');
    	const jwtToken = queryParams.get('token');
      history.push(`/dashboard?auth=${xSocialAuth}&type=${loginType}&token=${jwtToken}`);
    }

		if (import.meta.env.MODE === 'production' && domainPath ==  '/dashboard') {
			// redirectToSubdomain('dashboard');
		}
		handleShareableLink(hashValue);
  }, [location]);
  return null;
};


const LoginTeachDomain = () => {
  useEffect(() => {
    store.set("application_domain", "teaching");
		if (IS_DEVELOPMENT) {
			store.set("application_hostname", window.location.hostname)
		}
    window.location.href = `${import.meta.env.VITE_CC_URL_TEACH}/dashboard`;
  }, []);
  return null;
};

const AppRoutes = () => {
  return (
			<React.Suspense fallback={<div>Loading... </div>}>
				<Router history={history}>
					<RouteRedirect />
					<Routes>
						<Route exact path="/" Component={LandingLazy} />
						<Route path="/" element={<Root />} >
							<Route path="dashboard" element={<Dashboard />} />
							<Route path="login" element={<LoginTeachDomain />} />
							<Route path='admin' element={<Dashboard />} />
							<Route path="model-create-redirect" element={<Dashboard />} />
							<Route path="*" element={<NotFoundPage />}/>
						</Route>
						{/* <Route path="/research/dashboard" element={<RedirectToResearchDashboard />} /> */}
						<Route path="/institutional-onboarding" element={<InstitutionalOnboarding />} />
						<Route path="/development" component={DevFeaturesLazy} />
						<Route path="/courses" element={<Course />} />
						<Route path="/changelog" component={ChangeLogLazy} />
						<Route path="/ui-test" component={UITestLazy} />
					</Routes>
				</Router>
			</React.Suspense>
    );
}

export default AppRoutes;
