import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as CookieManager from "../../util/cookies";
import cc from '../../cc';


const URLS = {
	"support": "https://support.cellcollective.org",
	"research": import.meta.env.VITE_CC_URL_RESEARCH,
	"learn": import.meta.env.VITE_CC_URL_LEARN,
	"teach": import.meta.env.VITE_CC_URL_TEACH,
}

const DOMAINS = {
	"learn": "learning", "teach":"teaching", "research":"research"
}


/**
 * For React class components
 */
export const connectNavigation = (Component) => {
  return (props) => {
    const navigate = useNavigate();
    return <Component {...props} navigate={navigate} />;
  };
};

/**
 * Switching domains to: Learn, Teach, and Research.
 * This requires a Redux action from Application/actions.
 * Simply inform mapDispatchToProps function.
 * 
 * @domainKey must be one of the following: "learn", "research", or "teach"
 */
export const domainSwitcher = (domainKey, fnMappedDispatch, props, callback) => {
	// TODO: active the new dashboard
	if(domainKey == "research"){
		let redirect = `${URLS[domainKey]}`;
		window.location.href = `${redirect}/research/dashboard/`;
	} 
	else 
	if (import.meta.env.MODE === "development") {
			fnMappedDispatch(DOMAINS[domainKey]);
			if (props.user) {	
					CookieManager.SetCookie('transfer-auth-token', props.user.token);
			}
			if (typeof callback === 'function') {
				callback(props);
			}
			cc._.refresh({
				message: {
						message: "Loading...", type: 'info'
				},
				refreshIn: 1200
			});
	} else {
			window.location.href = `${URLS[domainKey]}/dashboard`;
	}
}