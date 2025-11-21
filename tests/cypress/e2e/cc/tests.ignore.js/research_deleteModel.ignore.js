/* @author: Yuri Danilov
 * The test case visits Research domain and tries to delete a model
 */

describe('Deleting Model', () => {

	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/'  //'https://develop-research.cellcollective.org/?dashboard=true#'
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
	const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"

	it('Signing In', () => {
		cy.visit(URL)
		cy.get('a[class=button-three]') //go to research
		  .click({force: true})
		cy.signin(email, password)
		cy.contains('Sign Out')
			.should('exist')
			.wait(3000)
	})

	it('Clicking New Logical Model', () => {
		cy.get('.menu').contains("Create")
			.first()
			.click({ force: true })
		cy.url()
			.should('contain', 'new-model')
		cy.get('.arrangement')
			.get('.view')
			.first()
			.should('exist')
		cy.wait(2000)
	})

	it('Navigate to User Model Dashboard by clicking CC logo', function () {
		cy.get('img[class="logoImg"]')
			.parent()
			.click()
		cy.get('.catalog li').contains('Shared With Me').click()
		cy.wait(10000)
	})

	it("Delete Model by Pressing 'Okay' ", function () {
		cy.get('div[class="remove"]').first().click()
		cy.wait(2000)
		cy.get('.content input[type="submit"]').wait(2000).click({ force: true })
	})

})
