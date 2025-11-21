/**
 * @author: Akshita Goel
 * Test for submitting course with public module on not upgraded account
 */
 Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

context('Sign_in_student',() => {

	const URL = Cypress.env('CC_TEST_URL') ||  /*'http://localhost:5000/' */ 'https://develop.cellcollective.org/'
	const teacherEmail = Cypress.env("CC_TEST_USERNAME") || "cchlteachertest@gmail.com"
	const teacherPassword = Cypress.env("CC_TEST_USERNAME") || "h9LtAhhZAq"

	before(() => {
		cy.visit(URL)
		cy.get('a[class=button-one]') //go to student
			.click({force: true})
		cy.get('.logoImg')
			.should('have.attr','src')
			.and('include','/assets/images/logo/learning/logo.png')
			cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
			.then(() => {
			cy.contains('Sign Up').click(({force: true}))
			//fill out sign up info form
			cy.get('div[class="app"] div[class="overlay"] div[class="content"] form[class="row-2"] input')
			.first().scrollIntoView().click({force: true}).type('abcd@email.com', {force: true})

			cy.get('div[class="app"] div[class="overlay"] div[class="content"] form[class="row-2"] input')
			.eq(1).scrollIntoView().click({force: true}).type('Abcd',{force: true})

			cy.get('div[class="app"] div[class="overlay"] div[class="content"] form[class="row-2"] input')
			.eq(2).scrollIntoView().click({force: true}).type('abcd12345',{force: true})

			cy.get('div[class="app"] div[class="overlay"] div[class="content"] form[class="row-2"] input')
			.eq(3).scrollIntoView().click({force: true}).type('Alpha',{force: true})

			cy.get('div[class="app"] div[class="overlay"] div[class="content"] form[class="row-2"] input')
			.eq(4).scrollIntoView().click({force: true}).type('abcd12345',{force: true})

			cy.get('div[class="overlay"] div[class="content"] form[class="row-2"] div[class="dropdown-text input"] input')
			.first().scrollIntoView().click({force: true}).type('Abc University',{force: true})

			cy.get('div[class="overlay"] div[class="content"] form[class="row-2"] span[class="checkbox"').click({force: true})
			cy.get('div[class="overlay"] div[class="content"] form[class="row-2"] button').first().click({force: true})
			})
	})

	beforeEach(() => {
		Cypress.Cookies.preserveOnce('connect.sid')
	})

	it('Submit Module', () => {
		//opens module
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="scroll"] div[class="scrollable overflow"] div[class="card"] div[class="learning"] div div')
			.contains('7.1 Adding, naming and moving dots (Cells)').first().click()
		//.should('have.text', '7.1 Adding, naming and moving dots (Cells)').click()

		cy.wait(4500)
		//start lesson
		cy.get('div[class="arrangement"] div[class="view"] div[class="compact"] div[class="content"] input').click()
		cy.get(' div[class="overlay"] div[class="content"] input').eq(1).click()
		//researcher
    cy.contains('Researcher').click()
		cy.contains('Activity1').click()
		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] ul[class="editable"] div[class="option"] input')
			.eq(1).click()
		cy.contains('Activity3').click()
		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] ul[class="editable"] div[class="option"] input')
			.eq(1).click()
		cy.contains('Activity2').click()
		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] ul[class="editable"] div[class="option"] input')
			.eq(1).click()
		//Explorer
			cy.contains('Explorer').click()
		cy.contains('Activity4').click()
		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] ul[class="editable"] div[class="option"] input')
			.eq(1).click()
		cy.contains('Activity5').click()
		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] ul[class="editable"] div[class="option"] input')
			.eq(1).click()
		//Submit lesson
		cy.contains('Submit lesson').click()
		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] ul[class="editable"] div[class="option"] input')
			.eq(1).click()
		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] ul[class="editable"]').eq(1).find('div[class="option"] input')
		.eq(1).click()
		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] ul[class="editable"]').eq(2).find('div[class="option"] input')
		.eq(1).click()
		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] ul[class="editable"]').eq(3).find('div[class="option"] input')
		.eq(1).click()
		cy.get('div[class="arrangement"] div[class="view"] div[class="compact"] div[class="content"] input').click()
		//completion certificate
		cy.get('div[class="app"] div[class="overlay"] div[class="content"] input').eq(1).click()
	})

	it('Sign In teacher', () => {
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
			.then(() => {
				cy.contains('Instructor Access')
					.click({force: true})
			})
		cy.wait(2500)

		cy.get('input[name=username]')
			.type(teacherEmail, {force: true})
		cy.get('input[name=password]')	
		  .type(teacherPassword, {force: true})
		cy.get('button[type=submit]')
		  .click({force: true})
		cy.wait(1000)
	})

	it('Generate Report', () => {
		cy.contains('Public Modules').click()
		cy.wait(3000);
		// open module after checking module title
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="scroll"] div[class="scrollable overflow"] div[class="card"] div[class="learning"] div div')
			.contains('7.1 Adding, naming and moving dots (Cells)').first().click()
		//generate report
		cy.wait(1000)
		cy.contains('Reports').trigger('mouseover')
			.then(() => {
				cy.contains('Generate Student Report')
				.click()
			})
		cy.get('div[class="app"] div[class="overlay"] div[class="content"] form[class="reportDialog no-format"] input').eq(2).click()
	})
})





