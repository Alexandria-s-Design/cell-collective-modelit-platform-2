/**
*
* @author Yuri Danilov
* Test case for changing dashboard view and navigating between tabs
*
**/

context('Teaching Dashboard', () => {

	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/'
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
	const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"

	it('Signing In', () => {
		cy.visit(URL)
		cy.get('a[class=button-two]') //go to teach
		  .click({force: true})
		cy.signin(email, password)
		cy.contains('Sign Out')
			.should('exist')
			.wait(3000)
		})

	it('Switching view of models', () => {
		cy.get('div.panel.modelCards').should('be.visible')
		cy.get('span.icon.base-table.checkbox').click()
		cy.get('div.panel').should('be.visible')
	})

	it('Click Public Modules Tab', () => {
		cy.get('.catalog').contains('Public Modules').click().should('have.class', 'selected')
	})

	it('Click My Modules Tab', () => {
		cy.get('.catalog').contains('My Modules').click().should('have.class', 'selected')
	})
	it('Click Shared with Me Tab', () => {
		cy.get('.catalog').contains('Shared with Me').click().should('have.class', 'selected')
	})

	it('Click My Courses Tab', () => {
		cy.get('.catalog').contains('My Courses').click().should('have.class', 'selected')
	})

})
