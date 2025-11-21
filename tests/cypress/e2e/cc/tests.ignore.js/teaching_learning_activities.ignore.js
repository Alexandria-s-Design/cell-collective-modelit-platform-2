/**
 * @author: Phillip Nguyen
 * The following code tests the behaviour of the TEACH Domain.
 */
import 'cypress-audit/commands';



context('ModelIt! Test - Teaching Homepage ', () => {
	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' //'https://teach.cellcollective.org/?dashboard=true#'
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNLI@gmail.com"
	const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"


	beforeEach(() => {
		cy.visit(URL)
		cy.clearCookies()
		// get to dashboard
		cy.url().should('contains', URL)
		cy.get('a[class=button-two]') //go to teach
		  .click({force: true})

		// put in username / password for teacher
		cy.signin(email, password)
		cy.get('.arrangement').get('div[class="joyride"]').invoke('hide')
	})
	it('should run performance audits', () => {
		cy.visit(URL);
		cy.lighthouse(
			{
				performance: 80,
				accessibility: 90,
				'best-practices': 80,
				seo: 80,
			},
			{
				formFactor: 'desktop',
				screenEmulation: {
					mobile: false,
					disable: false,
					width: Cypress.config('viewportWidth'),
					height: Cypress.config('viewportHeight'),
					deviceScaleRatio: 1,
				},
			},
		);
	});
	it('Add New Model and Rename it', () => {
		cy.get("div[class='heading']")
			.contains("Create")
			.first()
			.click({ force: true })
		cy.get('div[class="editable enabled"]').click()
		cy.focused().clear().type('this is a test model').blur()
		cy.get('div[class="editable enabled"]').should('contain', 'this is a test model')
	})

})
