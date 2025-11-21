/**
 * @author: Jozef Cabala
 * Full test for CBM
 */
Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

Cypress.config("viewportWidth", 1566); // to enable drag and drop for regulators panel

context('New CBM',() => {

	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' 
	const email = Cypress.env("CC_TEST_EMAIL") || "CCHLTestUNL@gmail.com"
	const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"
	const numOfMetabolites = 3
	const numOfGens = 3
	const numOfReactions = 1
	const numOfExperiments = 1

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

	it('Create new CBM', () => {
		cy.wait(300)
		cy.get('#app > div > div > div > div.heading.appBar > div.mainTopbar > div > ul > li > ul > li:nth-child(2) > ul > li:nth-child(1) > div > span').click({force: true})
	})

	it('Add Metabolites and Reaction', () => {
		cy.wait(300)
		for(let i = 0; i < numOfMetabolites; i++) {
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.bar > div > input.icon.base-add').click()
		}

		cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.bar > div > input.icon.base-add').click()
	})

	it('Renaming Metebolites and Reactions', () => {
		for(let i = 1; i <= numOfMetabolites; i++) {
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(' + i + ') > td:nth-child(1)')
			.click()
			.then(() => {
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table.selected > tbody > tr > td:nth-child(1)')
					.click()
					.clear()
					.type('Metabolite ' + i)
			})
		}
	})

	it('Add Descriptions and References to Metabolites', () => {
		const description = 'metabolit description '
		const reference = '25790483'

		for (let i = 1; i <= numOfMetabolites; i++) {
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(' + i + ') > td:nth-child(1)')
				.click()
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

	it('Drag and drop metabolites to Reactants', () => {		
		cy.document().then((doc) => {
      const droppableDiv = doc.querySelectorAll('div[class="droppable"]');
    
			// Drag and Drop of Reactants
			for(let i = 0; i < numOfMetabolites; i++) {
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(1)')
					.click()

				const tables = doc.querySelectorAll("table.selected");
				const td = tables[0]
					.querySelectorAll("tbody")[0]
					.querySelectorAll("tr")[0]
					.querySelectorAll("td")[0];

				if(i == numOfMetabolites - 1) {
					// Drag and Drop to Products
					cy.dragAndDrop(td, droppableDiv[1]);
				} else {
					// Drag and Drop to Reactants
					cy.dragAndDrop(td, droppableDiv[0]);
				}
			}

      cy.wait(300);
    });
	})

	it.skip('Save the Model', () => {
		cy.contains("File").trigger("mouseover").then(() => {
			cy.contains("Save")
				.click()
		});

		cy.wait(5000);

    // Confirm the model was saved
    cy.contains("Save").parent().parent().should("have.class", "disabled");
		cy.get('div[class="bar"]').first().click({force: true})
	})

	it('Go to Gene Regulation', () => {
		cy.get('#app > div > div > div > div.heading.appBar > div:nth-child(3) > div > ul > li.Gene_Regulation')
			.click()
	})

	it('Add Genes', () => {
		for(let i = 0; i < numOfGens; i++) {
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.bar > div > input.icon.base-add')
				.click()
		}
	})

	it('Renaming Genes', () => {
		for(let i = 1; i <= numOfGens; i++) {
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(' + i + ') > td:nth-child(2)')
			.click({force: true})
			.then(() => {
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table.selected > tbody > tr > td:nth-child(2)')
					.click()
					.clear()
					.type('Gene ' + i)
			})
		}
	})

	it('Fill knowledge base and add reference', () => {
		const description = 'gene	 description '
		const reference = '25790483'

		for (let i = 1; i <= numOfMetabolites; i++) {
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(' + i + ') > td:nth-child(2)')
				.click()
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

	it('Move genes to positive regulators', () => {		
		cy.document().then((doc) => {
      const droppableDiv = doc.querySelectorAll('div[class="droppable"]');
    
			// Drag and Drop of Reactants
			for(let i = 0; i < numOfGens; i++) {
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(' + (i + 1) + ') > td:nth-child(2)')
					.click({force: true})

				const tables = doc.querySelectorAll("table.selected");
				const td = tables[1]
					.querySelectorAll("tbody")[0]
					.querySelectorAll("tr")[0]
					.querySelectorAll("td")[0];

				// if(i == numOfMetabolites - 1) {
				// 	// Drag and Drop to Negative Regulators
				// 	cy.dragAndDrop(td, droppableDiv[1]);
				// } else {
				// 	// Drag and Drop to Positive Regulators
				// 	cy.dragAndDrop(td, droppableDiv[0]);
				// }

				// Drag and Drop to Positive Regulators
				cy.dragAndDrop(td, droppableDiv[0]);

			}

      cy.wait(300);
    });
	})

	
	it('Go to Objective Function', () => {
		cy.get('#app > div > div > div > div.heading.appBar > div:nth-child(3) > div > ul > li.Objective_Function')
			.click()
	})

	it('Add Objective Function', () => {
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(2) > div > div.bar > div > input.icon.base-add')
			.click()
	})

	it('Drop reaction to Objective Function Builder', () => {		
		cy.document().then((doc) => {
      const droppableDiv = doc.querySelectorAll('div[class="droppable"]');
    
			// Drag and Drop of Reactants
			for(let i = 0; i < numOfReactions; i++) {
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(' + (i + 1) + ') > td')
					.click({force: true})

				const tables = doc.querySelectorAll("table.selected");
				const td = tables[1]
					.querySelectorAll("tbody")[0]
					.querySelectorAll("tr")[0]
					.querySelectorAll("td")[0];

				cy.dragAndDrop(td, droppableDiv[0]);
			}

      cy.wait(300);
    });
	})

	it('Fill knowledge base and add reference', () => {
		const description = 'reaction	 description '
		const reference = '25790483'

		for (let i = 1; i <= numOfReactions; i++) {
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(' + i + ') > td')
				.click({force: true})
				.then(() => {
					cy.get('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > div > div > div > div > div > div > h1 > input')
						.click()
					cy.get('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > div > div > div > div > div > div > ul > div > li > div > div.editable.enabled.def.togglePmid')
						.click()
						.then(() => {
							cy.get('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > div > div > div > div > div > div > ul > div > li > div > form')
								.find("input")
								.type(`${description}${i}{enter}`);
			
							// add reference
							cy.get('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > input')
								.click()
								.then(() => {
									cy.get('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > li > div > div.editable.enabled.def.togglePmid')
										.click()
										.then(() => {
											cy.get('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > li > div > form')
												.find("input")
												.type(`${reference}{enter}`);
																	cy.wait(1000); // wait for DOI search to complete
										});
								});
						});
				})
		}
	})

	it.skip('Save the Model', () => {
		cy.contains("File").trigger("mouseover").then(() => {
			cy.contains("Save")
				.click()
		});

		cy.wait(5000);

    // Confirm the model was saved
    cy.contains("Save").parent().parent().should("have.class", "disabled");
		cy.get('div[class="bar"]').first().click({force: true})
	})

	it('Go to Analysis', () => {
			cy.get('#app > div > div > div > div.heading.appBar > div:nth-child(2) > div.menu.menuBar.MODEL > div > ul > li.Analysis_metabolic')
				.click()
	})

	it('Add Experiment', () => {
		for(let i = 1; i <= numOfExperiments; i++) {
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(2) > div > div.bar > div > input.icon.base-add')
				.click()
		}
	})

	it('Rename Experiment', () => {
		for(let i = 1; i <= numOfExperiments; i++) {
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(2) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(' + i + ') > td:nth-child(1)')
				.click({force: true})
				.then(() => {
					cy.get('#app > div > div > div > div.arrangement > div:nth-child(2) > div > div.content > div > div > div > div.scrollable > div > table.selected > tbody > tr > td:nth-child(1)')
						.click()
						.clear()
						.type('Experiment ' + i)
				})
		}
	})

	it('Change Flux Range', () => {
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table.selected > tbody > tr > td.activity.range > div > div.track > div > div:nth-child(2)')
			.realMouseDown({ position: "center" })
			.realMouseMove(5, 0)
			.realMouseUp()
	})

	it('Select Genes', () => {
		for(let i = 1; i <= (numOfGens - 1); i++) {
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(' + i + ') > td.metabolic-mutation_gene.checkbox > span')
				.click()
		} 
	})

	it('Run experiment', () => {
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div > div > div.simulation.control > input')
			.click()
	})

	it.skip('Save the Model', () => {
		cy.contains("File").trigger("mouseover").then(() => {
			cy.contains("Save")
				.click()
		});

		cy.wait(5000);

    // Confirm the model was saved
    cy.contains("Save").parent().parent().should("have.class", "disabled");
		cy.get('div[class="bar"]').first().click({force: true})
	})
})
