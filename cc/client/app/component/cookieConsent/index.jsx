import React, { useEffect, useState } from "react";
import "./style.scss";

const CookieContainer = ({ openCookiesSettings, rejectAllCookies, acceptAllCookies }) => {

	return <div id="cookiePopup" className="cookie-container">
		<div className="cookie-content">
			<h2 className="cookie-title">We use cookies for analysis and website improvement.</h2>
			<p className="cookie-description">
				This web application uses cookies to analyze traffic and enhance the user experience.
				We do not collect cookies for personalized advertising. By clicking “Accept All,” you agree to their use, or you can customize your settings according to your preferences.
			</p>

			<div className="cookie-buttons">
				<button className="cookie-btn cookie-customize" onClick={openCookiesSettings}>Manage Settings</button>
				<button className="cookie-btn cookie-reject" onClick={rejectAllCookies}>Reject All</button>
				<button className="cookie-btn cookie-accept" onClick={acceptAllCookies}>Accept All</button>
			</div>
		</div>
	</div>
}

const CookieModal = ({ rejectAllCookies, saveMyPreferences, acceptAllCookies, checked, setChecked }) => {
	const [essentailCookieDesc, setEssentailCookieDesc] = useState(false)
	const [cookieSettingsDesc, setCookieSettingsDesc] = useState(false)

	const toggleDesc = (e, id) => {
		e.preventDefault();
		const target = document.getElementById(id)
		if (target) {
			if (target.style.display == 'block') {
				target.style.display = 'none';
				if (id == "essential-cookies-desc") {
					setEssentailCookieDesc(false)
				} else if (id == "gen-cookies-desc") {
					setCookieSettingsDesc(false)
				}

			} else {
				target.style.display = 'block';
				if (id == "essential-cookies-desc") {
					setEssentailCookieDesc(true)
				} else if (id == "essential-cookies-desc") {
					setCookieSettingsDesc(true)
				}
			}
		}
	}

	return <div id="cookieModal" className="cookie-modal">
		<div className="cookie-modal-content">
			<h2 className="cookie-title">Your cookie settings</h2>
			<p className="cookie-description">
					We take good care of you and your data. You can read more about our <a onClick={() => {document.getElementById('privacy-and-cookie-policy').style.display = 'block'}}>Cookie policy and Privacy policy</a> and update your cookie settings here.
			</p>


			<div className="cookie-section">
				<div onClick={(e) => toggleDesc(e, "gen-cookies-desc")} className="cookie-option">
					<span className="cookie-icon">🍪</span>
					<span className="cookie-text">How we use cookies</span>
					<span className="cookie-arrow">{cookieSettingsDesc ? '⌄' : '›'}</span>
				</div>
				<div className="cookie-section-description" id="gen-cookies-desc">
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
				<div onClick={(e) => toggleDesc(e, "essential-cookies-desc")} className="cookie-option">
					<span className="cookie-icon">✔️</span>
					<span className="cookie-text">Essential Cookies (Always Enabled)</span>
					<span className="cookie-arrow">{essentailCookieDesc ? '⌄' : '›'}</span>
				</div>
				<div className="cookie-section-description" id="essential-cookies-desc">
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
						<input type="checkbox" id="analyticsCookies" onChange={(e) => {setChecked(e.target.checked)}}  checked={checked} />
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

const CookiePolicy = () => {
	useEffect(() => {
		showCookieDialog();
		loadCookiePreferences();
		document.addEventListener("cookiePreferencesUpdated", handleCookiePreferencesUpdated);

		return () => {
			document.removeEventListener("cookiePreferencesUpdated", handleCookiePreferencesUpdated);
		};
	}, []);

	const [checked, setChecked] = useState(() => {
		return JSON.parse(localStorage.getItem('cookiePreferences') || '{}').analyticsCookies || false
	})

	const showCookieDialog = () => {
		const modal = document.querySelector("#cookiesDialog");
		const savedPreferences = localStorage.getItem("cookiePreferences");

		if (!savedPreferences && modal) {
			modal.style.display = "block";
		} else {
			modal.style.display = "none";
		}
	};

	const loadCookiePreferences = () => {
		const savedPreferences = localStorage.getItem("cookiePreferences");
		if (savedPreferences) {
			const preferences = JSON.parse(savedPreferences);
			const analyticsCheckbox = document.getElementById("analyticsCookies");
			// const marketingCheckbox = document.getElementById("marketingCookies");

			if (analyticsCheckbox) analyticsCheckbox.checked = preferences.analyticsCookies;
			// if (marketingCheckbox) marketingCheckbox.checked = preferences.marketingCookies;
		}
	};

	const handleCookiePreferencesUpdated = (event) => {
		const preferences = event.detail;
		// console.log("Received cookie preferences in main app:", preferences);
		localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
		// TODO: send to server
	};



	const getCookiePreferences = () => {
		return {
			analyticsCookies: document.getElementById("analyticsCookies").checked,
			// marketingCookies: document.getElementById("marketingCookies").checked
		};
	}

	const closeCookiesModal = () => {
		document.getElementById('cookiesDialog').style.display = 'none';
		document.getElementById('dialog-cookieModal-backdrop').style.display = 'none';
	}


	const sendCookiePreferences = () => {
		const preferences = getCookiePreferences();
		document.dispatchEvent(new CustomEvent("cookiePreferencesUpdated", { detail: preferences }));
	}

	const openCookiesSettings = () => {
		document.getElementById('cookiePopup').style.display = 'none';
		document.getElementById('cookieModal').style.display = 'block';
		document.getElementById('dialog-cookieModal-backdrop').style.display = 'block';
	}

	const acceptAllCookies = () => {
		document.getElementById("analyticsCookies").checked = true;
		setChecked(true);
		// document.getElementById("marketingCookies").checked = true;
		sendCookiePreferences();
		closeCookiesModal();
	}

	const rejectAllCookies = () => {
		document.getElementById("analyticsCookies").checked = false;
		setChecked(false);
		// document.getElementById("marketingCookies").checked = false;
		sendCookiePreferences();
		closeCookiesModal();
	}

	const saveMyPreferences = () => {
		sendCookiePreferences();
		closeCookiesModal();
	}


	return <React.Fragment>
		<div id="dialog-cookieModal-backdrop"></div>
		<div id="cookiesDialog">		
		<CookieContainer rejectAllCookies={rejectAllCookies} acceptAllCookies={acceptAllCookies} openCookiesSettings={openCookiesSettings} />
		<CookieModal rejectAllCookies={rejectAllCookies} saveMyPreferences={saveMyPreferences} acceptAllCookies={acceptAllCookies} setChecked={setChecked} checked={checked} />
	</div>
	</React.Fragment>
}

export default CookiePolicy

