
/**
 * @author: Zdenek Vafek
 * Testing the Teacher site
 */
Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

context('Create_new_module_for_student',() => {

	const URL = Cypress.env('CC_TEST_URL') ||  'http://localhost:5000/' //'https://develop.cellcollective.org/#'
	const teacher_email = Cypress.env("CC_TEST_USERNAME") || "cchlteachertest@gmail.com"
	const teacher_password = Cypress.env("CC_TEST_USERNAME") || "Teacher_tests1"

	before(() => {
		cy.visit(URL)
		cy.clearCookies()
		cy.get('a[class=button-three]')
		  .click({force: true})
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

	beforeEach(() => {
		Cypress.Cookies.preserveOnce('connect.sid')
	})

	it('Open my module and add survey panel', () => {
		cy.contains("My Modules").click()
		cy.wait(5000)
		cy.get('img[class="model-img"]').eq(0).click({force: true})
		cy.wait(10000)
		cy.contains("ActivityGroup1").should('be.visible').click()
		cy.wait(10000)

		cy.get('input[class="icon base-close"]').first().click().then(()=> {cy.get('input[value="OK"]').click()})
		cy.get('input[class="icon base-close"]').first().click().then(()=> {cy.get('input[value="OK"]').click()})
		cy.get('input[class="icon base-close"]').first().click().then(()=> {cy.get('input[value="OK"]').click()})

		cy.contains("Insert").trigger('mouseover')
		.then(() => {
			cy.contains("Panel").trigger('mouseover')	
				.then(() => {
					cy.contains("Content").trigger('mouseover')
						.then(() => {
								cy.contains("Add Text Editor").click()
					})
			})
	    })

		cy.get('input[class="icon base-add"]').click()
		cy.get('input[title="Multiple choice"]').click()
		cy.get('input[class="icon base-add"]').click({multiple: true})
		cy.get('input[class="icon base-add"]').click({multiple: true})
		cy.get('input[type="checkbox"]').first().click()

		cy.contains("Insert").trigger('mouseover')
			.then(() => {
			cy.contains("Panel").trigger('mouseover')	
				.then(() => {
					cy.contains("Content").trigger('mouseover')
						.then(() => {
								cy.contains("Submit Button").click()
					})
			})
	})

		cy.contains("File").trigger('mouseover')
		 	.then(() => {cy.contains("Save").click()})
		cy.contains("File").trigger('mouseover')
			.then(() => {cy.contains("Share").click()})
		cy.get('input[class="icon base-add"]').first().click()
		cy.get('td[class="editable float"]').click().type("CCHLTestUNL@gmail.com")
		cy.contains("File").trigger('mouseover')
		 	.then(() => {cy.contains("Save").click()})
	})

})
