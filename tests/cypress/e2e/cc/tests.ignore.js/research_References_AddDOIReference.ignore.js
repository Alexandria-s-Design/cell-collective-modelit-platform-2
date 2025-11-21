/**
 * @author: Yuri Danilov
 * Test case for adding new reference to References Panel (Insert->Panel->Description->References)
 */

describe('Should add new reference when you click on the plus icon and type a number', function () {

	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/'
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
			.wait(1000)
	})

	it('Adding References Panel to Layout', () => {
		cy.get('.topbar .menu .checkbox').contains('References')
			.first()
			.click({ force: true })
	})

	it('Navigate to References and Click New Component', function () {
		cy.get('.arrangement .view input.icon.base-reference')
			.first()
			.click()
		cy.get('.arrangement .view .references div.editable.enabled.def')
			.first()
			.should('contain', 'pmid or doi')
			.click()
			.then(() => {
				cy.get('.arrangement .view .references form.editable.menu')
					.type('1')
				cy.get('.arrangement .view .references').first().parent().parent().click()
					.then(() => {
						cy.wait(2000)
							.get('.arrangement .view .references').first().get('a').should('exist')
					})
			})
	})

})
