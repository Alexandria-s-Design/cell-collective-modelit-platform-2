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

			//add description
			cy.get('div[class="arrangement"] div[class="view"]').eq(4)
				.find('div[class="content"] div[class="knowledgeBase phase2-model"] input[class="icon base-add"]').first().each(($input) => {
					cy.wrap($input).click()
				})
			
			cy.get('div[class="arrangement"] div[class="view"]').eq(4)
				.find('div[class="content"] div[class="knowledgeBase phase2-model"] ul').first()
				.find('div li div').first().click({force: true}).wait(100).type(`Test description ${cellAdded[i]}`)
		}

		// Sort names ascending
		cy.get('div[class="arrangement"] div[class="view"]').eq(1)
			.find('div[class="content"] th').first().click()
		cy.get('div[class="arrangement"] div[class="view"]').eq(1)
			.find('div[class="content"] th').first().click()
	})

	it('Adding reference', () => {
		cy.wait(3000)
		cy.get('.menuScrollbar').find('li').contains('Overview').click().wait(5000)

		//adding refrence
		cy.get('div[class="arrangement"] div[class="view"] div[class="actions"] input[class="icon base-reference"]').each(($input) => {
			cy.wrap($input).click()
		})

		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
		.find('ol[class="references"]').first().find('div').first().click({force: true}).wait(100).type(3423523)
	})

	it('Adding experimentts', () => {
		//opening analysis tab
		cy.wait(3000)
		cy.get('.menuScrollbar').find('li').contains('Analysis').click().wait(5000)


		for (let i = 0; i < tries; i++) {
			// adding experiments
			cy.get('div[class="arrangement"] div[class="view"] div[class="actions"] input[class="icon base-add"]').each(($input) => {
			cy.wrap($input).click()
			})
		}

		// Sort names ascending
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('th').first().click()
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('th').first().click()
	
	})

	//tests for sharing
	it('Share model', () => {
		cy.contains('File')
			.trigger('mouseover')
			.then(() => {
				cy.contains('Share')
				.click()
			})

		cy.contains('File').click()
	})

	it('Share with collaborators', () => {
		cy.wait(3000)
		//add collaborators
		for (let i = 0; i < tries; i++){
			cy.get('div[class="arrangement"] div[class="view"]').first()
				.find('div[class="actions"] input[class="icon base-add"]').each(($input) => {
				cy.wrap($input).click()
				})
			
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				 	.find('div table tbody[class="selectable"] tr td[class="float"]').first().click({force: true}).wait(100).then(() => {
				 		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				 			.find('div table[class="selected"] tbody tr td').first().click().should('have.class', 'editing float')
				 			.type(`test${i}@email.com`)
				})
		}

		//remove a collaborator
		cy.get('div[class="arrangement"] div[class="view"]').first()
				.find('div[class="actions"] input[class="icon base-remove"]').each(($input) => {
				cy.wrap($input).click()
				})
		
		//sort in ascending order
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('th').first().click()
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('th').first().click()
				

		for (let i = 0; i < tries; i++) {
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('div table tbody[class="selectable"] tr td[class="float"]').eq(i).should('have.text', shared[i])
		}

		//changing access
		let i = 0;
		cy.get('div[class="content"]')
			.find('div[class="scrollable"] table tbody')
			.find('tr').each(($createdExpr, index) => {
				if(i <= 2){
					cy.wrap($createdExpr).find('td[class="checkbox access"]').should('be.visible')

					if(i != 0){
						cy.wrap($createdExpr).find('span[class="checkbox"]').click({ force: true })
					}
					if(i == 2){
						cy.wrap($createdExpr).find('span[class="checkbox checked1"]').click({ force: true })
					}
					i++;
				}
			})	
		})

		//tests for shareable links
		it('Share with link', () => {
			//creating sharable links
			for(let i = 0; i < tries; i++){
				cy.get('div[class="arrangement"] div[class="view"]').eq(1)
					.find('div[class="actions"] input[class="icon base-add"]').each(($input) => {
					cy.wrap($input).click()
					})
			}

			//remove a sharable link
			cy.get('div[class="arrangement"] div[class="view"]').eq(1)
			 .find('div[class="actions"] input[class="icon base-remove"]').each(($input) => {
			 cy.wrap($input).click()
			 })

			//checking number of links created 
			cy.get('div[class="arrangement"] div[class="view"]').eq(1)
			 .find('div[class="scrollable"] table tbody[class="selectable"] tr').should('have.length', tries-1)
		})

		//tests for Experiments Publishing
		it('Experiments publishing', () => {
			for (let i = 0; i < tries; i++) {
				cy.get('div[class="arrangement"] div[class="view"]').eq(3)
					.find('div[class="content"] tr td[class="float"]').eq(i).should('have.text', experimentAdded[i])
			}

			let i = 0;
			cy.get('div[class="content"]')
			.find('table>tbody').last()
			.find('tr').each(($createdExpr) => {
				cy.wrap($createdExpr).find('td[class="checkbox public"]').should('be.visible')

				cy.wrap($createdExpr).find('span[class="checkbox"]').click({ force: true })
				i++
				if (i % 2) {
					cy.wrap($createdExpr).find('span[class="checkbox checked"]').click({ force: true })
				}
			})
		})

		//tests for publishing model
		it('Publish model tests', () => {
			cy.get('div[class="arrangement"] div[class="view"]').eq(2)
				.find('div[class="content"] div[class="publishing"] input[class="raised"]').each(($input) => {
					cy.wrap($input).click()
					})

			cy.get('div[class="overlay"] div[class="view"] div[class="content"]')
					.find('input').last().each(($input) => {
						cy.wrap($input).click()
						})
		})

})