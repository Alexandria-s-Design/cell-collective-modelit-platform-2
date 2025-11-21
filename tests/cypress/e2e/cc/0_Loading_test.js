/**
 * @author: Zdenek Vafek
 * Testing the Sign Up feature
 */
 Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})


context('SignUpResearcher',() => {

	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' 
	const teacher_email = Cypress.env("CC_TEST_USERNAME") || "cchlteachertest@gmail.com"
	const teacher_password = Cypress.env("CC_TEST_USERNAME") || "Teacher_tests1"

before(() => {
	cy.wait(3000)
})

	beforeEach(() => {
		cy.visit(URL)
	})

	it('Try access research site', () => {
		// cy.wait(432000000) // todo: remove this after debugging pipeline  (120 hours pause for debug)
		cy.get('a[class=button-three]') //go to research
			.click({force: true});
		cy.wait(2000); // just to be sure /research/dashboard loads
		cy.reload() // to make sure no nginx timeout didn't stop http://web:5003/research/dashboard from sending response
		cy.wait(2000)
		cy.get('img[src="/assets/images/logo/research/logo.png"]')
	})

	it('Try access teacher site',() => {
		cy.get('a[class=button-two]') 
			.click({force: true})
		cy.wait(3000)
		cy.get('img[src="/assets/images/logo/teaching/logo.png"]')	
	})
	
	it('Try access learn site',() => {
		cy.get('a[class=button-one]') 
			.click({force: true})
		cy.wait(3000)	
		cy.get('img[src="/assets/images/logo/learning/logo.png"]')	
		// cy.wait(432000000); // todo: remove this after debugging pipeline  (120 hours pause for debug)
	})
})


