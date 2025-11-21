
/**
 * @author: Steph Juma
 */
 Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

context('SignUpResearcher',() => {

	const URL = Cypress.env('CC_TEST_URL') ||  'http://localhost:5000/' //'https://develop.cellcollective.org/#'
	const teacher_email = Cypress.env("CC_TEST_USERNAME") || "cchlteachertest@gmail.com"
	const teacher_password = Cypress.env("CC_TEST_USERNAME") || "Teacher_tests1"

	before(() => {
		cy.visit(URL)
		cy.clearCookies()
		cy.get('a[class=button-three]')
		  .click({force: true})
		cy.get('.logoImg')
			.should('have.attr','src')
			.and('include','/assets/images/logo/research/logo.png')
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
			.then(() => {cy.contains("Instructor Access").click()
			cy.wait(10000)
			cy.get('input[name="username"]')
				.clear()
				.type(teacher_email)
			cy.get('input[type="password"]')
				.clear()
				.type(teacher_password)
			cy.get('button[type="submit"]')		
				.click()
			cy.wait(5000)	
		})
	})

	it('Checking on manage subscriptions if exists', () => {
		cy.get('a[class=button-three]')
		  .click({force: true})
		cy.get('.logoImg')
			.should('have.attr','src')
			.and('include','/assets/images/logo/research/logo.png')
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
			.then(() => {cy.contains("Manage subscription").should('be.visible')
		})
	})
	
	it('Checking on upgrade button', () => {
		cy.get('a[class=button-three]')
		  .click({force: true})
		cy.get('.upgrade-btn').should('be.visible')
	})
})