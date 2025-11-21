/**
 * @author: Yuri Danilov
 * Test for making new model in Teach
 */

describe('Teaching Creating a New Model', function () {
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

	it('Create New Model by Pressing Menu Item', function () {
		cy.get("div.heading .mainTopbar .menu li span")
			.contains("Create")
			.first()
			.click({ force: true })
		//Assert that the new Model has been made
		cy.get('div[class="editable enabled"]')
			.should('contain', "New Model");
	})
})
