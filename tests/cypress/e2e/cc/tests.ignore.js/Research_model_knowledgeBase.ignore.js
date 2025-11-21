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
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
	const password = Cypress.env("CC_TEST_USERNAME") || "hdMHOMCPsm"
	const shared = ['CCHLTestUNL@gmail.com (Owner)', 'test0@email.com', 'test1@email.com', 'test2@email.com']
	const cellAdded = ['A', 'B', 'C', 'D']
	const experimentAdded = ['New Experiment 1', 'New Experiment 2', 'New Experiment 3', 'New Experiment 4']
	const tries = 4;
	const dataTransfer = new DataTransfer();

	before(() => {
		cy.visit(URL)
		cy.get('a[class=button-three]') //go to research
		  .click({force: true})
		cy.get('.logoImg')
			.should('have.attr','src')
			.and('include','/assets/images/logo/research/logo.png')
		cy.login(email, password)	
	})

	beforeEach(() => {
		Cypress.Cookies.preserveOnce('connect.sid')
	})

	it('New logical model', () => {
		cy.contains('New Model')
			.trigger('mouseover')
		cy.contains("Logical Model")
			.trigger('mouseover')
			.then(() => {
				cy.contains('Create')
				.click()
			})
	})

	//setting up basic experiment
	it('Adding a new component', () => {
		cy.wait(3000)
		for (let i = 0; i < tries; i++) {
			// Try internal, external and graph add
			cy.get('div[class="arrangement"] div[class="view"]').first()
				.find('div[class="actions"] input[class="icon base-add"]').each(($input) => {
				cy.wrap($input).click()
				})
		}

		// Sort names ascending
		cy.get('div[class="arrangement"] div[class="view"]').eq(1)
			.find('div[class="content"] th').first().click()
		cy.get('div[class="arrangement"] div[class="view"]').eq(1)
			.find('div[class="content"] th').first().click()
	})

	it('Open Knowledge Base tab', () => {
		cy.wait(3000)
		cy.get('.menuScrollbar').find('li').contains('Knowledge Base').click().wait(5000)
	})

	it('check components', () => {
		//check internal names
		for (let i = 0; i < tries; i++) {
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('div table tbody[class="selectable"] tr td[class="float"]').eq(i).should('have.text', cellAdded[i])
		}
	
	})

	it('knowledge base', () => {
		//add description
		cy.get('div[class="arrangement"] div[class="view"]').eq(1)
			.find('div[class="content"] div[class="knowledgeBase phase2-model"] input[class="icon base-add"]').first().each(($input) => {
				cy.wrap($input).click()
			})
		
		cy.get('div[class="arrangement"] div[class="view"]').eq(1)
			.find('div[class="content"] div[class="knowledgeBase phase2-model"] ul').first()
			.find('div li div').first().click({force: true}).wait(100).type('Test description')
			
		//adding refrence
		cy.get('div[class="arrangement"] div[class="view"] div[class="knowledgeBase phase2-model"] div[class="references"] input[class="icon base-reference"]').each(($input) => {
			cy.wrap($input).click({force: true})
		})

		cy.get('div[class="arrangement"] div[class="view"] div[class="knowledgeBase phase2-model"] div[class="references"]')
		.find('ol[class="references"]').first().find('div').first().click({force: true}).wait(100).type(3423523)

		//add Regulatory Mechanism Summary
		cy.get('div[class="arrangement"] div[class="view"]').eq(1)
			.find('div[class="content"] div[class="knowledgeBase phase2-model"] div input[class="icon base-add"]').first().each(($input) => {
				cy.wrap($input).click()
			})
		
		cy.get('div[class="arrangement"] div[class="view"]').eq(1)
			.find('div[class="content"] div[class="knowledgeBase phase2-model"] div ul').eq(1)
			.find('div li div').first().click({force: true}).wait(100).type('Test summary')

	})

})
