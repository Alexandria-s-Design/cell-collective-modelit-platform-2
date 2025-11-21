/**
 * @author: Zdenek Vafek
 * Testing the Sign Up feature
 */
Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})


context('Changing platforms',() => {

	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' 
	const teacher_email = Cypress.env("CC_TEST_USERNAME") || "cchlteachertest@gmail.com"
	const teacher_password = Cypress.env("CC_TEST_USERNAME") || "Teacher_tests1"

	before(() => {
		cy.visit(URL)
	})

	it('Try access research site', () => {
		cy.get('a[class=button-three]') 
			.click({force: true})
		cy.get('img[src="/assets/images/logo/research/logo.png"]')
		//cy.get('div[class="card recent-card-view"]').should('be.visible')
	})

	it.skip('Try to switch to Teach site', () => {
		cy.get('div[id="instructorAccessCheckbox"]').click({force: true})
		cy.wait(5000)
		cy.get('img[src="/assets/images/logo/teaching/logo.png"]')
	})

	it.skip('Try to switch to Learn site', () => {
		cy.get('input[class="icon base-close"]').then($el => {
			if ($el.is(':visible')) {
				cy.wrap($el).click();
			} else {
				cy.log('Element is not visible');
			}
		});
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
		.then(() => {cy.contains("Student Access").click({force: true})});
		cy.wait(5000)	
		cy.get('img[src="/assets/images/logo/learning/logo.png"]')	
	})

	it.skip('Try to switch to research site', () => {
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
		.then(() => {cy.contains("Research Platform").click({force: true})});
		cy.wait(5000)	
		cy.get('img[src="/assets/images/logo/research/logo.png"]')
		cy.location('pathname').should('eq', '/research/dashboard/')	
	})
});