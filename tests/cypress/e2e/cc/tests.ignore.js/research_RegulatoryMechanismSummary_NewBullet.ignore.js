/**
 * @author: Yuri Danilov
 * This test case for adding a new bullet for Regulatory Mechanism Summary
 */

describe('Should add a new bullet when you click plus sign next to Regulatory Mechanism summary and type text', function () {
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
		cy.wait(3000)
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

	it('Open Model tab', () => {
		cy.wait(3000)
		cy.get('.menuScrollbar')
			.find('li')
			.contains('Model')
			.click()
			.wait(500)
	})

	it('Adding a new component', () => {
		cy.get('.arrangement .view .actions input.icon.base-add')
			.first()
			.click()
	})

	it('Create new bullet for Regulatory Mechanism Summary', function () {
		cy.contains('Regulatory Mechanism Summary')
			.get('input[title="Add Content"]')
			.last()
			.click({ force: true })
		cy.get('div.editable.enabled.def.togglePmid')
			.contains('Text')
			.click({ force: true })
			.then(() => {
				cy.get('.arrangement .view .knowledgeBase form.editable.menu')
					.type('Summary test text')
				cy.get('.arrangement .view .knowledgeBase').first().click()
					.then(() => {
						cy.wait(2000)
							.get('.arrangement .view .knowledgeBase .editable.enabled')
							.first()
							.should('contain', 'Summary test text')
					})
			})
	})

})
