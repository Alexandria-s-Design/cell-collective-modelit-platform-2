import React from "react";

const CookieAndPrivacyPolicy = () => {
	return (
	<div id="privacy-and-cookie-policy" style={{ zIndex: 1009, width: '700px'}} className="cookie-modal">
		<div>
			<input type="button" style={{	position: 'fixed', left: '94%', top: '10px'}} className="icon base-close" onClick={() => {document.getElementById('privacy-and-cookie-policy').style.display = 'none'}} />
		</div>
		<h1 style={{textAlign: 'center'}}>Cookie Policy</h1>

		<h2>1. Introduction</h2>
		<p>This document explains how our web application uses cookies and what options you have for managing them.</p>

		<h2>2. What are cookies?</h2>
		<p>Cookies are small text files stored on your device when you visit a website. They help us analyze traffic and remember your preferences.</p>

		<h2>3. What cookies do we use?</h2>
		<ul>
			<li><strong>Essential cookies</strong> – Required for the proper functioning of the application and cannot be disabled.</li>
			<li><strong>Analytical cookies</strong> – Help us understand user behavior and improve the application. We use Google Analytics 4 (GA4), which anonymizes data.</li>
		</ul>

		<h2>4. How can you manage cookies?</h2>
		<p>You can change your preferences in the cookie settings or delete them via your browser settings.</p>

		<h2>5. More information</h2>
		<p>For more details on how Google Analytics processes data, see <a href="https://policies.google.com/privacy" target="_blank">Google Analytics Privacy Policy</a>.</p>

		<h1 style={{textAlign: 'center'}}>Privacy Policy</h1>

		<h2>1. Introduction</h2>
		<p>Your privacy is important to us. This document describes how we process personal data and what rights you have.</p>

		<h2>2. What data do we collect?</h2>
		<p>Our application collects the following information:</p>
		<ul>
			<li><strong>Analytical data (Google Analytics 4)</strong> – Anonymous information about how you use the application.</li>
			<li><strong>Essential technical data</strong> – Such as IP address for application security.</li>
		</ul>

		<h2>3. How do we use the data?</h2>
		<p>To analyze traffic and improve the user experience.</p>
		<p>We never share your data with third parties for advertising purposes.</p>

		<h2>4. Your rights</h2>
		<p>Under GDPR, you have the right to:</p>
		<ul>
			<li>Request access to your data.</li>
			<li>Request correction or deletion of your data.</li>
			<li>Opt out of tracking via analytical cookies.</li>
		</ul>

		<h2>5. Contact</h2>
		<p>If you have any questions regarding data protection, please contact us at <a href="mailto:info@discoverycollective.com">info@discoverycollective.com</a>.</p>
	</div>)
}

export default CookieAndPrivacyPolicy