/**
 * @author: Phillip Nguyen
 * 
 * Lighthouse Performance using cypress-audit & cy.lighthouse()
 * 
 */

import 'cypress-audit/commands';



context('ModelIt! Test - Teaching Homepage ', () => {
	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' //'https://research.cellcollective.org/?dashboard=true#'
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNLI@gmail.com"
	const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"

	it.only('should run performance audits', () => {
		cy.visit(URL);
		cy.viewport(1920, 1080)
		Cypress.config("taskTimeout", 120000);
		// expect(myConfig).to.have.property('pageLoadTimeout', 120000)

		cy.lighthouse({
			performance: 14, // cellcollective production performance is 14-15 => set threshold accordingly
			accessibility: 60,
			"best-practices": 70,
			'server-response-time': 100,
			seo: 73,
			/*
			The PWA Audit displaying a gray dash like the image below is not a bug but a feature
			=> no need to add pwa
			*/
		},
			{
				formFactor: 'desktop',
				screenEmulation: {
					mobile: false,
					disable: false,
					width: 1920,
					height: 1080,
					deviceScaleRatio: 1,
				},
			},
		);
	})
})
