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
	
	it('Logical Model Overview - check if all views are visible', () => {
		cy.get('li[class="Overview_boolean"]').click()
		cy.contains("Description")
			.should('be.visible')
		cy.contains("References")
			.should('be.visible')
		cy.contains("Graph")
			.should('be.visible')	
		cy.contains("Components")
			.should('be.visible')	
			cy.contains("Knowledge Base")
			.should('be.visible')	
	})

	//adding cells for testing in analysis tab
	it('Adding a new component', () => {

		for (let i = 0; i < tries; i++) {
			// Try internal, external and graph add
			cy.get('div[class="arrangement"] div[class="view"] div[class="actions"] input[class="icon base-add"]').each(($input) => {
			cy.wrap($input).click()
			})
		}
	
		// Sort names ascending
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('th').first().click()
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('th').first().click()
	
		// check internal names
		for (let i = 0; i < tries; i++) {
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('div table tbody[class="selectable"] tr td[class="float"]').eq(i).should('have.text', cellAdded[i])
		}
	
	})

	it('Open Analysis tab', () => {
		cy.wait(3000)
		cy.get('.menuScrollbar').find('li').contains('Analysis').click().wait(5000)
	})

	//tests for experiments view
	it('Adding experimentts', () => {

		for (let i = 0; i < tries+1; i++) {
			// adding experiments
			cy.get('div[class="arrangement"] div[class="view"] div[class="actions"] input[class="icon base-add"]').each(($input) => {
			cy.wrap($input).click()
			})
		}
		
		cy.get('div[class="arrangement"] div[class="view"] div[class="actions"] input[class="icon base-remove"]').each(($input) => {
			cy.wrap($input).click()
			})

		// Sort names ascending
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('th').first().click()
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('th').first().click()

		// check experiment names
		for (let i = 0; i < tries; i++){
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('div table tbody[class="selectable"] tr td[class="float"]').eq(i).should('have.text', experimentAdded[i])
		}
	
	})

	it('Renaming the experiment', () => {
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('div table tbody[class="selectable"] tr td[class="float"]').first().click({force: true}).wait(100).then(() => {
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
					.find('div table[class="selected"] tbody tr td').first().click().should('have.class', 'editing float')
					.type('Test Experiment')
			})
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]').first().click()
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('div tbody[class="selectable"] tr td').first().should('have.text', 'Test Experiment')

	})

	it('Check the checkbox', () => {
		let i = 0;
			cy.get('div[class="content"]')
				.find('table>tbody[class="selectable"]').first()
				.find('tr').each(($createdExpr) => {
					cy.wrap($createdExpr).find('td[class="checkbox selection"]').should('be.visible')

					cy.wrap($createdExpr).find('span[class="checkbox"]').click({ force: true })
					i++
					if (i % 2) {
						cy.wrap($createdExpr).find('span[class="checkbox checked"]').click({ force: true })
					}
				})
	})

	//tests for Experiment settings
	it('Simulation play', () => {

		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('div table tbody[class="selectable"] tr td[class="float"]').first().click()

		cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="scrollable overflow"] input[class="icon large-run"]').each(($input) => {
		cy.wrap($input).click()
		})

		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('div[class="simulation control"] dl dt').first().should('have.text', 'Completed:')

		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('div[class="simulation control"] dl dd').first().should('have.text', '100%')
		
	})

	//tests internal components
	it('Check internal component', () => {
		//check component in table
		for (let i = 0; i < tries; i++){
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('div[class="panel bar"] table tbody tr td[class="float"]').eq(i).should('have.text', cellAdded[i])
		}

		let i = 0;
			cy.get('div[class="content"]')
				.find('div[class="panel bar"] div[class="scrollable"] table tbody').first()
				.find('tr').each(($createdExpr) => {
					//initialState checkbox does not get checked and checks checkbox mutation instead
					// cy.wrap($createdExpr).find('td[class="checkbox initialState"]').should('be.visible')
					// cy.wrap($createdExpr).find('span[class="checkbox"]').click({ force: true })

					cy.wrap($createdExpr).find('td[class="checkbox mutation"]').should('be.visible')
					cy.wrap($createdExpr).find('span[class="checkbox"]').click({ force: true })

					i++
					if (i <= 2) {
						cy.wrap($createdExpr).find('span[class="checkbox checked1"]').click({ force: true })
					}
				})
		
	})

	//tests graph components
	let graphComponents = []
	it('Check graph components', () => {
		for(let i = 8; i < 8 + tries; i++){
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('div[class="scrollable"] table tbody tr td[class="float"]').eq(i).should('have.text', cellAdded[i - 8])
		}
		
		let i = 0;
			cy.get('div[class="content"]')
				.find('div[class="scrollable"] table tbody')
				.find('tr').each(($createdExpr, index) => {
					if (index >= 9){
						cy.wrap($createdExpr).find('td[class="checkbox radio"]').should('be.visible')
						cy.wrap($createdExpr).find('span[class="checkbox"]').first().click({ force: true })

						cy.wrap($createdExpr).find('td[class="checkbox"]').should('be.visible')
						cy.wrap($createdExpr).find('span[class="checkbox"]').last().click({ force: true })

						i++
						if (i > 2) {
							cy.wrap($createdExpr).find('span[class="checkbox checked"]').last().click({ force: true })
						}else{
							graphComponents.push(cellAdded[i-1])
						}
					}
					
				})
	})

	//testing activity relationships graph
	it('Check graph legend', () => {
		for (let i = 0; i < graphComponents.length; i++){
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('div[class="dc-chart"] g[class="dc-legend"] g[class="dc-legend-item"]').eq(i).should('have.text', graphComponents[i])
		}
		
	})

})
