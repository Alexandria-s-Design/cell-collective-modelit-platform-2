
/**
 * @author: Zdenek Vafek
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

context('NewLogicalModel',() => {

	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' 
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
	const email1 = Cypress.env("CC_TEST_USERNAME") || "testSharing@email.com"
	const password = Cypress.env("CC_TEST_USERNAME") || "hdMHOMCPsm"
	const cellAdded = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
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
		cy.wait(10000)	
	})


	beforeEach(() => {
		Cypress.Cookies.preserveOnce('connect.sid')
	})

	it('New logical model', () => {
		cy.wait(10000)
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

/////research_model_tab
it('Open Model tab', () => {
	cy.wait(3000)
	cy.get('.menuScrollbar').find('li').contains('Model').click().wait(5000)
})

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
	/*
	for (let i = 0; i < tries * 2; i++) {
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('div table tbody[class="selectable"] tr td[class="float"]').eq(i).should('have.text', cellAdded[i])
	}
	*/
})

it('Renaming a component, Graph, Internal, External', () => {
	// Internal Component
	cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
		.find('div table tbody[class="selectable"] tr td').first().click().wait(100).then(() => {
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('div table[class="selected"] tbody tr td').first().click().should('have.class', 'editing float')
				.type('test')
		})
	cy.get('div[class="arrangement"] div[class="view"] div[class="content"]').find('.canvas').first().click()
	cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
		.find('div tbody[class="selectable"] tr td').first().should('have.text', 'test')
})

it('Internal Comoponent Panel - Regulatory Mechanism and Knowledge Base', () => {
	cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="scrollable"]')  //div[class="scrollable overflow"]
		.eq(0)
		.find('div table tbody[class="selectable"] tr td[class="float"]').each(($iComp) => {
			cy.wrap($iComp).click()
			// Should be appear in Regulatory Mechanism
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('ul[class="regulation biologic"]')
				.should('be.visible')
			// Should be appear in Knowledge Base
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('div[class="knowledgeBase phase2-model"]')
				.should('be.visible')
		})
})

it('Internal Component Panel - Searching', () => {
	cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
		.find('div[class="editable enabled def"]').first().click().then(() => {
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('div form[class="editable menu"]').type('test')
		})
})

it('External Component Panel', () => {
	var eComps_sorted = Array()
	cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="panel bar"] div div[class="scrollable"]')
		.find('tr td[class="float"]').each(($eComp) => {
			eComps_sorted.push($eComp.text())
		})
	for (let i = 0; i < eComps_sorted.length - 1; i++) {
		expect(eComps_sorted[i]).to.be.lessThan(eComps_sorted[i + 1])
		}
	cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="panel bar"] div div').should('have.class', 'scrollable')
	// Should not display any regulatory mechanism
	cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="panel bar"] div div[class="scrollable"]')
		.find('tr td[class="float"]').first().click().then(() => {
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('ul')
				.should('not.have.class', 'regulation biologic')
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('div[class="knowledgeBase phase2-model"]')
				.should('be.visible')
		})
})

it.skip('Regulatory Mechanism - Dragging', () => {
	// Basal Level appear when hoverd over ball icon
	var MyDataTransfer = function () {};
	var dt = new MyDataTransfer ();
	dt.types = [];
	cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div div[class="scrollable"]')
		.find('div table tbody[class="selectable"] tr td[class="float"]').first().click().then(() => {
			cy.get('div[class="arrangement"] div[class="view"] div[class="actions"]')
				.find('span[class="icon base-absentState checkbox"]')
				.should('have.attr', 'title', 'Basal Value').click().then(() => {
					cy.get('div[class="arrangement"] div[class="view"] div[class="actions"] span')
						.should('have.class', 'icon base-absentState checkbox checked')
				})
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div div[class="scrollable"]')
				.find('div table tbody[class="selectable"] tr td[class="float"]').eq(0)//.contains("Atest")
				.trigger('dragstart', { dataTransfer: dataTransfer })
			cy.contains("Regulatory Mechanism")	
				.trigger('drag', {dataTransfer: dataTransfer})
			cy.contains("Drop Positive Regulator")
				.trigger('drop', {dataTransfer: dataTransfer})	
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div div[class="scrollable"]')
				.find('div table tbody[class="selectable"] tr td[class="float"]').eq(1)
				.trigger('mousedown', { which: 1 }).wait(100).then(() => {
					cy.contains('Regulatory Mechanism').trigger('mousemove', { force: true })
					cy.contains('Drop Negative Regulator')
						.trigger('mousemove', { force: true })
						.trigger('mouseup', { force: true })
				})
		})
})

it.skip('Regulatory Mechanism - Working on a component ', () => {		//Test should work fine, but not pass, because there are problems with regulatory mechanism. 
	cy.get('div[class="arrangement"] div[class="view"] div[class="content"]').find('.canvas').first().click()
	cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div div[class="scrollable"]')
		.find('div table tbody[class="selectable"] tr td[class="float"]').first().click().then(() => {
			// Clicking on state
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('ul[class="regulation biologic"] span li div:nth-child(1)>div:nth-child(1)').each(($cell) => {
					cy.wrap($cell).invoke('attr', 'class').then((prevState) => {
						cy.wrap($cell).click()
						if (prevState == 'positive') {
							cy.wrap($cell).should('have.class', 'negative')
						} else {
							cy.wrap($cell).should('have.class', 'positive')
						}
					})
				})
			// Clicking on dominance
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('ul[class="regulation biologic"] span li div:nth-child(1)')
				.find('input[value="Dominance"]').first().click().then(() => {
					cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
						.find('div[class="dominance menu"] ul li').each(($li) => {
							cy.wrap($li).click()
						})
				})
			// Condition are droppable after click (+) sign
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('ul[class="regulation biologic"] span')
				.find('div[class="droppable"]')
				.find('input[class="icon base-add"]').each(($condAdd) => {
					cy.wrap($condAdd).click()
				}).then(() => {
					cy.contains('Conditions')
					cy.contains('Drop Components Here')
					cy.contains('SubConditions')
				}).then(() => {
					cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div div[class="scrollable"]')
						.find('div table tbody[class="selectable"] tr td[class="float"]').eq(1)
						.trigger('mousedown', { which: 1 }).wait(100).then(() => {
							cy.contains('Drop Components Here')
								.trigger('mousemove', { force: true })
								.trigger('mouseup', { force: true }).then(() => {
									cy.contains('is Active')
									cy.contains('If/When').trigger('mouseover').then(() => {
										cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
											.find('ul[class="regulation biologic"]')
											.find('input[class="icon base-add-gray hidden"]').click().then(() => {
												cy.contains('New Component').click().then(() => {
													cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
														.find('ul[class="regulation biologic"] div')
														.find('div[class="internal new"] form')
												})
											})
									})
									cy.contains('If/When')
								})
						})
				})
			for (let i = 0; i < 2; i++) {
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
					.find('ul[class="regulation biologic"] div').first()
					.trigger('mouseover').then(() => {
						cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
							.find('ul[class="regulation biologic"] span li div')
							.find('input[class="icon base-close-gray"]').first().click()
							.wait(500)
					})
			}
		})
})

it('Clear Filters', () => {
	cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="search menu"] div[class="remove"]').click()
	cy.get('div[class="arrangement"] div[class="view"] div[class="content"]').find('.canvas').first().click()
})


	////////////////////////////// research_model_analysis

	it.skip('Experiment Panel', () => {
		cy.contains("Analysis").click()
		cy.get('div[class="bar"]').first().then(($expr) => {
			cy.wrap($expr).contains('Experiment')
			for (let i = 1; i <= 6; i++) {
				cy.wrap($expr).find('input[class="icon base-add"]').click().then(() => {
					cy.contains(`New Experiment ${i}`).should('be.visible')
				})
			}
			for (let i = 1; i <= 3; i++) {
				cy.wrap($expr).find('input[class="icon base-remove"]').click().then(() => {
					cy.get('div[class="content"]')
						.find('table>tbody[class="selectable"]').first()
						.find('tr').its('length').should('eq', 6 - i)
				})
			}/*
			cy.wrap($expr).find('input[class="icon base-copy"]').then(($copy) => {
				cy.wrap($copy).should('have.attr', 'title', 'Copy')
				for (let i = 1; i <= 3; i++) {
					cy.wrap($copy).click()
					cy.contains(`New Experiment 3 (${i})`)
				}
			})*/
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
			cy.wrap($expr).find('input[class="icon base-run"]').click()
			cy.get('div[class="search menu"]').eq('0').find('div[class="editable enabled def"]').click()
			cy.get('div[class="simulation control"]').find('input').click().wait(500)
			cy.get('div[class="simulation control"]').children().should('have.length', 3)
		})
	})

	//////Simulation
	it.skip('Open Simulation tab', () => {
		cy.get('.menuScrollbar').find('li').contains('Simulation').click().wait(500)
		cy.wait(3000)
	})

	///////Sharing model to user testSharing@email.com
	it.skip('Share model', () => {

		cy.contains('File').trigger('mouseover').then(() => {cy.contains('Share').click()})
		cy.get('div[class="arrangement"] div[class="view"]').first()
			.find('div[class="actions"] input[class="icon base-add"]').each(($input) => {
			cy.wrap($input).click()
			cy.get('td[class="editable float"]').type(email1)
		})	
		cy.contains('File').trigger('mouseover').then(() => {cy.contains('Save').click()})
	})

	it.skip('check if model was shared with testSharing@emai.com', () => {
		cy.visit(URL)
		cy.get('a[class=button-three]') //go to research
		  .click({force: true})
		cy.wait(3000)
		// cy.get('.right').should('be.visible');
		// cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
		//  .then(() => {cy.contains("Sign Out").click()})
		cy.login(email1, password)
		cy.contains("Shared With Me").click()
		cy.wait(10000)
		cy.get('.card').should('be.visible') 
	})
})
