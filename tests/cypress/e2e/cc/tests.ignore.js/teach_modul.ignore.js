/**
 * @author: Zdenek Vafek
 * Teach modul - test if all components are visible
 */

 Cypress.on('uncaught:exception', (err, runnable) => {
	// returning false here prevents Cypress from
	// failing the test
	return false
})


describe('Teaching Creating a New Model', function () {
	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/'
	const email = Cypress.env("CC_TEST_USERNAME") || "cchlteachertest@gmail.com"
	const password = Cypress.env("CC_TEST_PASSWORD") || "Teacher_tests1"

	before(() => {
		cy.visit(URL)
		cy.get('a[class=button-two]') //go to teach
		  .click({force: true})
		cy.get('input[name=username]')
			.type(email, {force: true})
		cy.get('input[name=password]')	
		  .type(password, {force: true})
		cy.get('input[type=submit]')
		  .click()	
	})

	it('Test my courses', () => {
		cy.contains("Test Teacher")
			.should('be.visible')
		cy.contains("My Courses")
			.click()	
		cy.get('input[title="Add course"]')
			.should('be.visible')
			.click()
		cy.get('svg[class="MuiSvgIcon-root MuiSvgIcon-fontSizeLarge"]')
		cy.get('path[d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"]')
		  .first()
			.click({force: true})
		cy.get('div[title="My Modules"]')
			.click()
		cy.contains('(245070) New Model 3') //
			.click()
		cy.contains('New Model 3') //
			.should('be.visible')
		cy.get('input[title="Delete course"]')	
			.first()
			.click()
		cy.get('input[type=submit]')
			.click()	
	})

	it('Test my modules', () => {
		cy.contains("My Modules")
			.click()
		cy.contains('New Model 3') //
			.should('be.visible')	
	})

	it('Test Public Modules', () => {
		cy.contains("Public Modules")
			.click()
		cy.get('div[class="card"]')
			.should('exist')	
	})

	it('Test share page', () => {
		cy.contains("My Modules")
		  .click()
		//cy.get('div[class="frame grid-models"]')
		cy.contains('New Model 3') //
			.click()
		cy.contains("Share")
			.click({force: true})
		cy.contains("Share with Collaborators")
			.should('be.visible')	
		cy.contains("Shareable Links")
			.should('be.visible')		
		cy.contains("Publish your Model")
			.should('be.visible')		
		cy.contains("Experiments Publishing")
			.should('be.visible')		
	})

	it('Test of permanent ID of model', () => {
		cy.contains("245070") //
			.should('be.visible')
	})
})
