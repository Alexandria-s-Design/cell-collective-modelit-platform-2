import React, {useEffect, useRef, useState} from "react";

import view from "../../base/view";
import './style.scss';


const CookieModal = () => {
	const [essentailCookieDesc, setEssentailCookieDesc] = useState(false)
	const [cookieSettingsDesc, setCookieSettingsDesc] = useState(false)
	const [cookiesStatusText, setCookiesStatusText] = useState('')
	const checkedRef = useRef(null)
	const [checked, setChecked] = useState(() => {
		return JSON.parse(localStorage.getItem('cookiePreferences') || '{}').analyticsCookies || false
	})
	
	// useEffect(() => {
	// 	const dialog = document.getElementById('dialog-cookieModal')
	// 	if(dialog && window.getComputedStyle(dialog).display == 'none') {
	// 		document.body.classList.remove('has-modal');			
	// 	}

	// })

	const acceptAllCookies = () => {
		checkedRef.current.checked = true;
		setChecked(true)
		// document.getElementById("marketingCookies").checked = true;
		sendCookiePreferences();
		// closeCookiesModal();
	}

	const rejectAllCookies = () => {
		checkedRef.current.checked = false;
		setChecked(false)
		// document.getElementById("marketingCookies").checked = false;
		sendCookiePreferences();
		// closeCookiesModal();
	}

	const saveMyPreferences = () => {
		sendCookiePreferences();
		// closeCookiesModal();
	}

	const getCookiePreferences = () => {
		return {
			analyticsCookies: checkedRef.current.checked,
			// marketingCookies: document.getElementById("marketingCookies").checked
		};
	}

	const closeCookiesModal = () => {
		document.body.classList.remove('has-modal');
		const cookieModal = document.getElementById('dialog-cookieModal');
		if(cookieModal){
			cookieModal.style.display = 'none';
			cookieModal.parentElement.remove()
		}
		// document.getElementById('dialog-cookieModal')
		// document.getElementsByClassName('overlay').forEach(el => el.classList.remove('overlay'))
		
		// document.body.classList.remove('overlay');
	}

	const sendCookiePreferences = () => {
		const preferences = getCookiePreferences();
		document.dispatchEvent(new CustomEvent("cookiePreferencesUpdated", { detail: preferences }));
		if(preferences){
			const accepted =  <span style={{color: 'green'}}> All Cookies Accepted! </span>;
			const rejected =  <span style={{color: 'red'}}> All Cookies Rejected! </span>;
			preferences.analyticsCookies ? setCookiesStatusText(accepted) : setCookiesStatusText(rejected);
		}
	}

	const toggleDesc = (e, id) => {
		e.preventDefault();
		const target = document.getElementById(id)
		if (target) {
			if (target.style.display == 'block') {
				target.style.display = 'none';
				if (id == "dialog-essential-cookies-desc") {
					setEssentailCookieDesc(false)
				} else if (id == "dialog-gen-cookies-desc") {
					setCookieSettingsDesc(false)
				}

			} else {
				target.style.display = 'block';
				if (id == "dialog-essential-cookies-desc") {
					setEssentailCookieDesc(true)
				} else if (id == "dialog-essential-cookies-desc") {
					setCookieSettingsDesc(true)
				}
			}
		}
	}

	return <div id="dialog-cookieModal" style={{padding: '20px'}}>
		<div className="cookie-modal-content">
		{cookiesStatusText != '' && cookiesStatusText}
			<h2 className="cookie-title">Your cookie settings</h2>
			<p className="cookie-description">
			We take good care of you and your data. You can read more about our <a onClick={() => {document.getElementById('privacy-and-cookie-policy').style.display = 'block'}}>Cookie policy and Privacy policy</a> and update your cookie settings here.
			</p>


			<div className="cookie-section">
				<div onClick={(e) => toggleDesc(e, "dialog-gen-cookies-desc")} className="cookie-option">
					<span className="cookie-icon">🍪</span>
					<span className="cookie-text">How we use cookies</span>
					<span className="cookie-arrow">{cookieSettingsDesc ? '⌄' : '›'}</span>
				</div>
				<div className="cookie-section-description" id="dialog-gen-cookies-desc">
					<br />
					<span className="cookie-text">
						<strong> Essential Cookies (Always Enabled)</strong>
						<br />
						These cookies are necessary for the proper functioning of the application. Without them, basic functionality such as login or saving your preferences would not be possible.

						<i>Example: Storing your cookie consent settings.</i>
						<br />
						<strong> Analytical Cookies (Optional)</strong>
						<br />
						These cookies help us understand how users interact with our application and allow us to continuously improve it. We only track aggregated anonymized data and do not use cookies for targeted advertising.
						<br />
						<strong>Tool Used:</strong> <br />
						Google Analytics 4 (GA4)
						<br />
						<strong>Purpose:</strong> <br /> Collecting anonymous statistics on website traffic and user behavior.</span>
				</div>
			</div>

			<div className="cookie-section">
				<div onClick={(e) => toggleDesc(e, "dialog-essential-cookies-desc")} className="cookie-option">
					<span className="cookie-icon">✔️</span>
					<span className="cookie-text">Essential Cookies (Always Enabled)</span>
					<span className="cookie-arrow">{essentailCookieDesc ? '⌄' : '›'}</span>
				</div>
				<div className="cookie-section-description" id="dialog-essential-cookies-desc">
					<br />
					<span className="cookie-text">
						These cookies are necessary for the proper functioning of the application. Without them, basic functionality
						such as login or saving your preferences would not be possible.
						<i>Example: Storing your cookie consent settings.</i>
					</span>
				</div>
			</div>

			<div className="cookie-section">
				<div className="cookie-option">
					<span className="cookie-icon">📊</span>
					<span className="cookie-text">Accept analytical cookies (Optional)</span>
					<label className="cookie-switch">
						<input ref={checkedRef} type="checkbox" id="dialogAnalyticsCookies" onClick={(e) => {setChecked(e.target.checked)}}  checked={checked}  />
						<span className="cookie-slider"></span>
					</label>
				</div>
			</div>

			{/* <div className="cookie-section">
				<div className="cookie-option">
					<span className="cookie-icon">💬</span>
					<span className="cookie-text">Accept marketing cookies</span>
					<label className="cookie-switch">
						<input type="checkbox" id="marketingCookies" />
						<span className="cookie-slider"></span>
					</label>
				</div>
			</div> */}

			<div className="cookie-settings-buttons">
				<button className="cookie-btn cookie-reject" onClick={rejectAllCookies}>Reject All</button>
				<button className="cookie-btn cookie-customize" onClick={saveMyPreferences}>Save My Preferences</button>
				<button className="cookie-btn cookie-accept" onClick={acceptAllCookies}>Accept All</button>
			</div>
		</div>
	</div>
}

const e = view(CookieModal);
e.width = 470;
e.height = 640;

export default e;

// export default CookieModal;

