/** 
 * @author: Dat Le
 * The test case logs in as a teacher, and try to add two components Feedback Loops List and Feedback Graph View
**/
Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

describe('Adding Feedback Loops List and Feedback Graph View', () => {

	const URL = Cypress.env('CC_TEST_URL') || 'https://develop.cellcollective.org'
	const teacher_email = Cypress.env("CC_TEST_USERNAME") || "cchlteachertest@gmail.com"
	const teacher_password = Cypress.env("CC_TEST_PASSWORD") || "Teacher_tests1"
	
	it('Log In As A Teacher', () => {
		cy.visit(URL)
		cy.get('a[class=button-two]') //go to research
			.click({force: true})
		
		cy.get('input[name="username"]')
			.clear()
			.type(teacher_email)
		cy.get('input[type="password"]')
			.clear()
			.type(teacher_password)		
		cy.get('[type="submit"]')
			.click()
		cy.wait(5000)		
		
	})

	//adding a new module and filling out the form
	it('Teacher site - Add A New Module', () => {
		cy.contains('New Module')
			.trigger('mouseover')
		cy.contains("Logical Model")
			.trigger('mouseover')
		cy.contains('Create')
			.click()
		.then(() => {
			cy.contains("Overview")
				.should('be.visible')
				cy.contains("Supporting Materials")
				.should('be.visible')
				cy.contains("References")
				.should('be.visible')
				cy.contains("Properties")
				.should('be.visible')
				
		        cy.get('.area > .editable')
				.type('A test module')
		        cy.get('.options > .icon')
				.click()
			cy.contains('High school')
				.click()
			cy.get('div[class="editable enabled def bold"]')
				.click()
			cy.get('form[class="editable menu bold"]')
				.click()
				.clear()
				.type('2')
				
			cy.get('input[type="button"][class="icon base-add"]')
				.eq(0)
				.click()
			cy.get('div[class= "editable enabled def"]')
				.click()
			cy.get('form[class="editable menu"]')
				.click()
				.clear()
				.type('A Test Objective')
			
			cy.get('input[type="button"][class="icon base-add-activity-group"]')
				.click()
			cy.contains("ActivityGroup1")
				.click()
				
			//insert feedback loops list and feedback graph view, then test if they are visible
			cy.contains("Insert").trigger('mouseover')
				.then(() => { 
				        cy.contains("Panel").trigger('mouseover')
				        .then(() => { 
						cy.contains("Feedback Loops").trigger('mouseover')
							.then(() => {
								cy.contains("Feedback Loops List")
									.click()
								cy.contains("Feedback Graph View")
									.click()
							})
					})		
				})
			cy.contains("Feedback Loops List")
				.should('be.visible')
			cy.contains("Feedback Graph View")
				.should('be.visible')				
		})
	})














































	
})  
