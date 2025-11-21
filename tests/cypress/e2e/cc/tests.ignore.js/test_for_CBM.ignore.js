/**
 * @author: Stefan Juma
 */
Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

context('Test for CBM', () => {

	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/'
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
	const password = Cypress.env("CC_TEST_USERNAME") || "hdMHOMCPsm"
	const cellAdded = ['mA', 'mB', 'mC', 'mD', 'mE', 'mF', 'mG', 'mH']
	const tries = 4;
	const dataTransfer = new DataTransfer();


	before(() => {
		cy.visit(URL)
		cy.get('a[class=button-three]') //go to research
			.click({ force: true })
		cy.get('.logoImg')
			.should('have.attr', 'src')
			.and('include', '/assets/images/logo/research/logo.png')
		cy.login(email, password)
	})


	beforeEach(() => {
		Cypress.Cookies.preserveOnce('connect.sid')
	})

	it('New CBM model', () => {
		cy.contains('New Model')
			.trigger('mouseover')
		cy.contains("Constraint-Based Model")
			.trigger('mouseover')
			.then(() => {
				cy.contains('Create')
					.click()
			})
	})

	it('Content-Based Model Overview - check if all views are visible', () => {
		cy.contains("Reactions")
			.should('be.visible')
		cy.contains("Metabolites")
			.should('be.visible')
		cy.contains("Graph")
			.should('be.visible')
		cy.contains("Reaction")
			.should('be.visible')
		cy.contains("Knowledge Base")
			.should('be.visible')
	})

	//research_model_tab
	it('Open Model tab', () => {
		cy.wait(3000)
		cy.get('.menuScrollbar').find('li').contains('Model').click().wait(5000)
	})

	// adding a new metabolite
	it('Adding a new metabolites', () => {

		for (let i = 0; i < tries; i++) {
			// Try internal, external and graph add
			cy.get('div[class="arrangement"] div[class="view"] div[class="actions"] input[class="icon base-add"]').each(($input) => {
				cy.wrap($input).click()
			})
		}

		// Sort names ascending
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('th').first().click()
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('th').first().click()

	})

})

