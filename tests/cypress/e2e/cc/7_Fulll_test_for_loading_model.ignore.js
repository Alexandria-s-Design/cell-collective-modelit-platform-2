
/**
 * @author: Jozef Cabala
 * Full test for loading model
 */
Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

Cypress.config("viewportWidth", 1366); // to enable drag and drop for regulators panel

context('New Logical Model',() => {

	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' 
	const email = Cypress.env("CC_TEST_EMAIL") || "CCHLTestUNL@gmail.com"
	const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"
	const numOfExternalComponents = 2

	before(() => {
		cy.visit(URL)
		cy.get('a[class=button-three]') //go to research
			.click({force: true})
		cy.contains('Please sign in to be able to save your work.')
		.should('be.visible')		
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
			.then(() => {cy.contains("Sign In").click()
				.then(() => {
					cy.get('input[name=username]')
						.type(email, {force: true})
					cy.get('input[name=password]')
						.type(password, {force: true})
					cy.get('button[type=submit]')
						.click()
					cy.get('.right')
						.should('be.visible')
				})
			})
		cy.wait(10000)	
	})

	beforeEach(() => {
		Cypress.Cookies.preserveOnce('connect.sid')
	})

	// new model - logical model - create new
	it('Create new logical model', () => {
		cy.wait(300)
		cy.contains('New Model')
			.should('be.visible')		
		cy.get('div[class="menu"]').trigger('mouseover')
			.then(() => {
				cy.contains("Logical Model").trigger('mouseover')
				.then(() => {
					cy.contains("Create").click()
				})
			})
	})

	it('Open Model Tab', () => {
		cy.wait(300)
		cy.get('.menuScrollbar')
			.find('li')
			.contains('Model')
			.click()
			.wait(500)
	})

	it('Add Internal and External Components', () => {
		cy.contains('div[class="view"]', 'Internal Components')
			.find('input[class="icon base-add"]')
			.click()

		cy.wait(100)

		cy.contains('div[class="view"]', 'External Components')
			.find('input[class="icon base-add"]')
			.click()
			.click()
	})

	it('Renaming External Components', () => {
			const name = "external component"

			for(let i = 1; i <= numOfExternalComponents; i++) {
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(' + i + ') > td')
					.click({multiple: true, force: true})
					.then(() => {
						cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table.selected > tbody > tr > td')
							.click()
							.type(name + i)
					})
			}
	})
	
	it('Add Descriptions and References to External Elements', () => {
			const description = 'External Elements Description '
			const reference = '25790483'
	
			for (let i = 1; i <= numOfExternalComponents; i++) {
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(' + i + ') > td')
					.click({multiple:true, force: true})
					.then(() => {
						cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > h1 > input')
							.click()
						cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > div.editable.enabled.def.togglePmid')
							.click()
							.then(() => {
								cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > form')
									.find("input")
									.type(`${description}${i}{enter}`);
				
								// add reference
								cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > input')
									.click()
									.then(() => {
										cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > li > div > div.editable.enabled.def.togglePmid')
											.click()
											.then(() => {
												cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > li > div > form')
													.find("input")
													.type(`${reference}{enter}`);
																		cy.wait(1000); // wait for DOI search to complete
											});
									});
							});
					})
			}
	})

	it('Renaming Internal Component', () => {
		const name = "internal component"
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr > td')
			.click({multiple: true, force: true})
			.then(() => {
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table.selected > tbody > tr > td.editable.float')
					.click({force: true})
					.type(name + '1')
			})
	})

	it('Add Descriptions and References to Internal Elements', () => {
		const description = 'Internal Elements Description '
		const reference = '25790483'

		cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr > td')
			.click({multiple: true, force: true})
			.then(() => {
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > h1 > input')
					.click()
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > div.editable.enabled.def.togglePmid')
					.click()
					.then(() => {
						cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > form')
							.find("input")
							.type(`${description}${1}{enter}`);
		
						// add reference
						cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > input')
							.click()
							.then(() => {
								cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > li > div > div.editable.enabled.def.togglePmid')
									.click()
									.then(() => {
										cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > li > div > form')
											.find("input")
											.type(`${reference}{enter}`);
																cy.wait(1000); // wait for DOI search to complete
									});
							});
					});
			})
	})

	it('Add edges (drag and drop to Regulatory mechanism)', () => {
		cy.document().then((doc) => {
			const droppableDiv = doc.querySelectorAll('div[class="droppable"]');
		
			const td = doc.querySelector('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(1) > td');

			cy.dragAndDrop(td, droppableDiv[0]);
	
			cy.wait(300);
		});
	})

	it('Add condition to Regulatory Mechanism', () => {
		cy.document().then((doc) => {
			const droppableDiv = doc.querySelectorAll('div[class="droppable"]');
		
			const td = doc.querySelector('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(2) > td');

			cy.dragAndDrop(td, droppableDiv[1]);
	
			cy.wait(300);
		});
	})

	it('Save model', () => {
    cy.contains("File").trigger("mouseover").then(() => {
			cy.contains("Save")
				.click()
		});
		cy.wait(5000);
    // confirm the model was saved
    cy.contains("Save").parent().parent().should("have.class", "disabled");
		cy.get('div[class="bar"]').first().click({force: true})
	})

	it('Go to simulation tab', () => {
			cy.get('.menuScrollbar').find('li').contains('Simulation').trigger('mouseover').click().wait(500)
	})

	it('Change Simulation speed', () => {
		cy.get('div[class="panel sim3-phase1"]')
			.find('div[class="track"]')
			.first()
			.children().children()
			.realMouseDown({ position: "center" })
			.realMouseMove(50, 0)
			.realMouseUp()
	})

	it('Change Sliding Window', () => {
		cy.get('div[class="panel sim3-phase1"]')
			.find('div[class="track"]')
			.last()
			.children().children()
			.realMouseDown({ position: "center" })
			.realMouseMove(40, 0)
			.realMouseUp()
	})

	// TODO check of external component does not work
	it('Select External and Internal Component', () => {
		// External Component check
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr > td.checkbox.visibility > span')
			.click({multiple: true})
		
		// Internal Component check
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr > td.checkbox.visibility > span')
			.click({force: true, multiple: true})
	})


	it('Start and Stop Simulation', () => {
		cy.get('input[class="icon large-run"]')
			.click();
		cy.wait(1000);
		cy.get('input[class="icon large-pause"]')
			.click();
	})

	it('Check if Graph is visible', () => {
		cy.get('div[class="dc-chart"]')
			.should('be.visible')
	})

	it('Change Updating form Synchronous to Asynchronous', () => {
		cy.contains('span[class="options"]', 'Synchronous')
			.find('input[class="icon base-menu"]')
			.click() 
			.then(() => {
				cy.get('div[class="menu"')
					.contains('li', 'Asynchronous')
					.click()
			})
	})

	it('Start and Stop Simulation 2', () => {
		cy.get('input[class="icon large-run"]')
			.click();
		cy.wait(1000);
		cy.get('input[class="icon large-pause"]')
			.click();
	})

	it('Check if Graph is visible 2', () => {
		cy.get('div[class="dc-chart"]')
			.should('be.visible')
			.wait(1000)
	})

	it('Go to Analysis → Dose Response', () => {
		cy.get('.menuScrollbar').find('li').contains('Analysis').trigger('mouseover').click().wait(500)
	})

	it('Change Name of Experiment', () => {
		cy.contains('div[class="view"]', 'Experiments')
			.find('input[class="icon base-add"]')
			.click()
			.wait(100)
			.then(() => {
				cy.contains('div[class="view"]', 'Experiments')
					.find('div table[class="selected"] tbody tr td[class="editable float"]')
					.click()
					.should('have.class', 'editing float')
					.type('experiment1')
			})
	})

	// TODO change number of Simulation do not work
	it.skip('Change number of Simulation', () => {
		const numberOfSimulation = '150'

		// TODO nevie to getnut neviem preco ??? 
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div > div:nth-child(1) > div.simulation.settings > dl:nth-child(2) > div')
			.click()
			.then(() => {
				cy.get('form[class="editable menu bold"]')
					.find("input") 
					.type(`${numberOfSimulation}{enter}`);
			});
	})

	it('Change Output Range', () => {
		cy.contains('div[class="view"]', 'Experiment Settings')
			.get('dd[class="range"]')
			.find('input')
			.click()
			.then(() => {
				cy.get('div[class="track"')
					.children()
					.find('div')
					.first()
					.realMouseDown({ position: "center" })
					.realMouseMove(-40, 0)
					.realMouseUp()
			})
	})

	it('Set up Activity Range of External Components', () => {
		cy.contains('div[class="view"]', 'External Components')
			.click()

		cy.get('div[class="track"')
			.children()
			.find('div')
			.first()
			.realMouseDown({ position: "center" })
			.realMouseMove(40, 0)
			.realMouseUp()
	})

	it('Select Internal Components', () => {
		cy.get('span[class="checkbox"]')
			.eq(3)
			.click()
	})

	it('Select Graph Components', () => {
		cy.get('span[class="checkbox"]')
			.eq(3)
			.click();
		cy.get('span[class="checkbox"]')
			.eq(5)
			.click();
	})

	it('Run Experiment', () => {
		cy.get('div[class="simulation control"]')
			.find('input[class="icon large-run"]')
			.click()
			.wait(1000)
	})

	it('Check if Graph is visible 2', () => {
		cy.get('div[class="dc-chart"]')
			.should('be.visible')
			.wait(1000)
	})

	it('Save model', () => {
    cy.contains("File").trigger("mouseover").then(() => {
			cy.contains("Save")
				.click()
		});
		cy.wait(5000);
    // confirm the model was saved
    cy.contains("Save").parent().parent().should("have.class", "disabled");
		cy.get('div[class="bar"]').first().click({force: true})
	})

	it('Go to Network Analysis', () => {
		cy.get('.menuScrollbar').find('li').contains('Network Analysis').trigger('mouseover').click().wait(500)
	})

	it('Select Topology and Run', () => {
		cy.get('input[class="icon large-list"]')
			.click();
		cy.get('input[class="icon large-run"]')
			.click();
	})

	it('Save model', () => {
    cy.contains("File").trigger("mouseover").then(() => {
			cy.contains("Save")
				.click()
		});
		cy.wait(5000);
    // confirm the model was saved
    cy.contains("Save").parent().parent().should("have.class", "disabled");
		cy.get('div[class="bar"]').first().click({force: true})
	})

	it('Go to Feedback Loops', () => {
		cy.get('ul[class="menuScrollbar bottom_tabs"]').find('li').contains('Feedback Loops').trigger('mouseover').click().wait(1000)
	})

	it('Check if Graph is visible 3', () => {
		cy.get('div[class="canvas"]')
			.should('be.visible')
			.wait(1000)
	})
	
})


