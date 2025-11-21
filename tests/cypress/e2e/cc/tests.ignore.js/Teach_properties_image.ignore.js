/**
 * @author: Savan Patel
 */
 Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

class DataTransfer {
	constructor() {
			this.data = {};
			this.types = [];
			this.files = [];
	}

	setData(format, data) {
			this.data[format] = data;
	}

	getData(format) {
			return this.data[format];
	}
}

context('SignUpResearcher',() => {

	const URL = Cypress.env('CC_TEST_URL') || /*'http://localhost:5000/'*/ 'https://develop.cellcollective.org/'
	const email = Cypress.env("CC_TEST_USERNAME") || "cchlteachertest@gmail.com"
	const password = Cypress.env("CC_TEST_USERNAME") || "Teacher_tests1"
	const dataTransfer = new DataTransfer();

	before(() => {
		cy.visit(URL)
		cy.get('a[class=button-two]') //go to teacher
		  .click({force: true})
		cy.get('.logoImg')
			.should('have.attr','src')
			.and('include','/assets/images/logo/teaching/logo.png')
		cy.get('input[name=username]')
			.type(email, {force: true})
		cy.get('input[name=password]')	
		  .type(password, {force: true})
		cy.get('button[type=submit]')
		  .click()	
	})

	beforeEach(() => {
		Cypress.Cookies.preserveOnce('connect.sid')
	})

	it('New logical model', () => {
		cy.contains('New Module')
			.trigger('mouseover')
		cy.contains("Logical Model")
			.trigger('mouseover')
			.then(() => {
				cy.contains('Create')
				.click()
			})
	})

	it('upload image', () => {
		cy.get('div[class="arrangement"] div[class="view"] div[class="cover"] label[class="icon base-image"] input[type="file"]')
		.selectFile('../cc/public/assets/img/landing/bg-jumbotron.jpg', {action: 'drag-drop', force: true})
	})
	
})
