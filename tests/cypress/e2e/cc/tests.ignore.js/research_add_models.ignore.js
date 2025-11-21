/** 
 * @author: Yuri Danilov, Zdenek Vafek
 * The test case visits Research domain and tries to create a new model
**/

describe('Adding Model', () => {

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
	})

	it('Import model is available after login', () =>{
		cy.visit(URL)
		cy.get('.menu')
		  .contains('Import')
			.click({force: true})
	})

})  
