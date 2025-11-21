import { eq } from "lodash"

/**
 * @author: Zdenek Vafek
 */
 Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

context('SignUpResearcher',() => {

	const URL = Cypress.env('CC_LEARN_TEST_URL') ||  'http://localhost:5000/' //'https://develop.cellcollective.org/' // 
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
	const password = Cypress.env("CC_TEST_USERNAME") || "hdMHOMCPsm"

	before(() => {
		cy.clearCookies()
		cy.visit(URL)
		cy.get('a[class=button-three]')
		  .click({force: true})
		cy.get('.logoImg')
			.should('have.attr','src')
			.and('include','/assets/images/logo/research/logo.png')
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
			.then(() => {cy.contains("Student Access").click()})
	})


	beforeEach(() => {
		//cy.restoreLocalStorage();
		
		Cypress.Cookies.preserveOnce('connect.sid')
	})
	
	it('Student login', () => {
		cy.wait(10000)
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
			.then(() => {cy.contains("Sign In").click()
			cy.get('input[name="username"]')
				.clear()
				.type(email)
			cy.get('input[type="password"]')
				.clear()
				.type(password)
			cy.get('button[type="submit"]')		
				.click()
		})
		cy.wait(5000)	
	})
	
	it('Go to my Learning', () => {
		cy.contains("My Learning").click()
		cy.wait(15000)
		//cy.get('div[class="cover research-cover"]').eq(0).click({force: true})
	})

	it.skip('Go to the module', () => { //R7V-57P-3LW
		cy.contains("My Courses").click()
		cy.get('input[name="field-0"]').click().type("R")
		cy.get('input[name="field-1"]').click().type("7")
		cy.get('input[name="field-2"]').click().type("V")
		cy.get('input[name="field-3"]').click().type("5")
		cy.get('input[name="field-4"]').click().type("7")
		cy.get('input[name="field-5"]').click().type("P")
		cy.get('input[name="field-6"]').click().type("3")
		cy.get('input[name="field-7"]').click().type("L")
		cy.get('input[name="field-8"]').click().type("W")
		cy.get('button[class="btnEnroll"]').click()
		cy.get('img[class="model-img"]').first().click()
		cy.wait(5000)
		cy.get('input[class="raised no-transform expand standalone learning"]').click()
		cy.contains("ActivityGroup1").click()
		cy.get('input[type="checkbox"]').first().click({force: true})
		cy.get('div[class="DraftEditor-editorContainer"]').eq(0).type("a")
		cy.get('div[class="DraftEditor-editorContainer"]').eq(1).type("a")
		cy.get('input[value="Submit Lesson"]').click({force: true})
	})
})	
