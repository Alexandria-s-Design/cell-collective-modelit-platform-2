/**
 * @author: Jozef Cabala
 */
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

Cypress.config("viewportWidth", 1366); // to enable drag and drop for reactants and products

const modelName = "Research Logical Model";
const path = require("path");
const downloadsFolder = Cypress.config("downloadsFolder");

context("Check logical model after export and import", () => {
  const URL =
    Cypress.env("CC_TEST_URL") || "https://research.cellcollective.org/"; //"http://localhost:5000"; // "https://hotfix-teach.cellcollective.org"; //    'https://develop.cellcollective.org/#'
  const teacher_email =
    Cypress.env("CC_TEST_EMAIL") || "cchlteachertest@gmail.com";
  const teacher_password = Cypress.env("CC_TEST_PASSWORD") || "Teacher_tests1"; //"h9LtAhhZAq"; // Change before push //For server
    // const teacher_password = Cypress.env("CC_TEST_USERNAME") || "h9LtAhhZAq"; //"h9LtAhhZAq"; // For dev
	
	// Variables for model creation
	const numOfExternalComponents = 2
	const numOfRegulators = 2
	const nameOfExternalComponent = "external component "
	const descriptionOfExternalComponent = 'External Components Description '
	const referenceOfExternalComponent = '25790483'

	const nameOfInternalComponent = "internal component "
	const descriptionOfInternalComponent = 'Internal Components Description '
	const referenceOfInternalComponent = '25790483'

	// Variables for model import chceck
	const referenceTextInImportedModel = '(Helikar T, 2015)'

	function login() {
		cy.visit(URL);
		cy.clearCookies();
		cy.get("a[class=button-three]").click({ force: true });
		cy.get(".logoImg")
			.should("have.attr", "src")
			.and("include", "/assets/images/logo/research/logo.png");
		cy.get('div[class="icon large-account menu right topRightMenu"]')
			.trigger("mouseover")
			.then(() => {
				cy.wait(5000);
				cy.contains("Research Platform").click();
				cy.get('div[class="icon large-account menu right topRightMenu"]')
					.trigger("mouseover")
					.then(() => {
						cy.contains("Sign In")
							.click()
							.then(() => {
								cy.get('input[name="username"]').clear().type(teacher_email);
								cy.get('input[type="password"]').clear().type(teacher_password);
								cy.get('button[type="submit"]').click().wait(5000);
							});
					});
			});
	}

	beforeEach(() => {
		Cypress.Cookies.preserveOnce('connect.sid')
	})

	context("Create Logical Model and export it", () => {
		before(() => {
			login();
		});

		it("Create logical model and download it", () => {
			// Create model
			cy.wait(10000)
			cy.contains("New Model").trigger("mouseover");
			cy.contains("Logical Model").trigger("mouseover").wait(1000);
			cy.get(
				"#app > div > div > div > div.heading.appBar > div.mainTopbar > div > ul > li > ul > li:nth-child(1) > ul > li:nth-child(1) > div > span"
			)
				.click({ force: true })
				.wait(5000);
			cy.contains("New Model").should("be.visible");
			
			// Rename the model
			cy.contains("New Model")
				.click()
				.then(() => {
					cy.get('form[class="editable menu"]')
						.find("input")
						.clear({ force: true })
						.type(modelName);
				});
		});


		it('Add Internal and External Components', () => {
				// Add Internal Components
				cy.contains('div[class="view"]', 'Internal Components')
						.find('input[class="icon base-add"]')
						.click()

				cy.wait(100)

				// Add External Components
				cy.contains('div[class="view"]', 'External Components')
						.find('input[class="icon base-add"]')
						.click()
						.click()
		})

		it('Renaming External Components', () => {
						for(let i = 1; i <= numOfExternalComponents; i++) {
								cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(' + i + ') > td')
										.click({multiple: true, force: true})
										.then(() => {
												cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table.selected > tbody > tr > td')
														.click()
														.type(`${nameOfExternalComponent}${i}`)
										})
						}
		})
		
		it('Add Descriptions and References to External Components', () => {		
						// Add description to External Components
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
																		.type(`${descriptionOfExternalComponent}${i}{enter}`);
								
																// Add reference to External Components 
																cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > input')
																		.click()
																		.then(() => {
																				cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > li > div > div.editable.enabled.def.togglePmid')
																						.click()
																						.then(() => {
																								cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > li > div > form')
																										.find("input")
																										.type(`${referenceOfExternalComponent}{enter}`);
																																				cy.wait(1000);
																						});
																		});
														});
										})
						}
		})

		it('Renaming Internal Component', () => {
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr > td')
						.click({multiple: true, force: true})
						.then(() => {
								cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table.selected > tbody > tr > td.editable.float')
										.click({force: true})
										.type(nameOfInternalComponent + '1')
						})
		})

		it('Add Descriptions and References to Internal Components', () => {
			  // Add description to Internal Components
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
														.type(`${descriptionOfInternalComponent}${1}{enter}`);
				
												// Add reference to Internal Components
												cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > input')
														.click()
														.then(() => {
																cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > li > div > div.editable.enabled.def.togglePmid')
																		.click()
																		.then(() => {
																				cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > ul > li > div > form')
																						.find("input")
																						.type(`${referenceOfInternalComponent}{enter}`);
																																cy.wait(1000);
																		});
														});
										});
						})
		})

		it('Add edges (drag and drop) to Regulatory mechanism)', () => {
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

				// Confirm the model was saved
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
				
				// Confirm the model was saved
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
				
				// Confirm the model was saved
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

		it('Save model', () => {
			cy.contains("File").trigger("mouseover").then(() => {
					cy.contains("Save")
							.click()
			});
			cy.wait(5000);
			
			// Confirm the model was saved
			cy.contains("Save").parent().parent().should("have.class", "disabled");
			cy.get('div[class="bar"]').first().click({force: true})
		})

		it('Export SBML', () => {
			const filePath = path.join(downloadsFolder, `${modelName} (SBML).sbml`);
	
			// Remove the file if it already exists
			cy.task('deleteFile', filePath).then(() => {
					cy.contains("File").trigger("mouseover");
					cy.contains("Download").trigger("mouseover");
					cy.contains("SBML")
							.click({ force: true })
							.wait(1000)
							.then(() => {
									cy.readFile(filePath).should("exist");
							});
			});
		});
	});

	context("Import Logical Model and check it", () => {		
		before(() => {
			login();
		});

		function checkComponentsKB(componentSelector, descriptionSelector, referenceSelector, descriptionValue, referenceValue, componentName){
			cy.get(componentSelector)
				.click({force: true, multiple: true})
				.invoke('text')
				.should('eq', componentName)
				.then(() => {
					cy.get(descriptionSelector)
						.invoke('text')
						.should('eq', descriptionValue);
					cy.get(referenceSelector)
						.invoke('text')
						.should('eq', referenceValue);
				});
		};

		it("Import of model", () => {
				cy.contains("New Model").trigger("mouseover");
				cy.contains("Constraint-Based Model")
						.trigger("mouseover")
						.then(() => {
								// Import model
								cy.get('input[name="fileImportInput"]')
										.first()
										.selectFile(path.join(downloadsFolder, `${modelName} (SBML).sbml`), {
												force: true,
										});
								cy.wait(9000);
								
								// Save imported model
								cy.contains("File").trigger("mouseover");
								cy.contains("Save")
									.click();
								cy.wait(1000);
						});
		});

		it("Check internal components", () => {
			// Internal Component
			checkComponentsKB(
				'#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr > td.float', 
				'#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div:nth-child(1) > div > ul > div > li > div > div.editable.enabled > span', 
				'#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div:nth-child(1) > div > ul > div > li > div > ul > div > li > span > i',
				`${descriptionOfInternalComponent}1`,
				referenceTextInImportedModel,
				`${nameOfInternalComponent}1`
			);

			// Check if regulator is positive
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table.selected > tbody > tr > td.regulator.number.checkbox.positive')
				.invoke('text')
				.should('eq', '1');

			// Check Upstream Regulators
			for(let i = 1; i <= numOfRegulators; i++){
				cy.get(`#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div:nth-child(1) > div > div:nth-child(4) > div:nth-child(5) > div:nth-child(${i}) > h2 > span`)
					.invoke('text')
					.should('eq', `${nameOfExternalComponent}${i}`);
			};
			
			// Check Regulatory Mechanism
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > span > div > div > div > div > div > ul > div > li > div:nth-child(1) > div.external > div:nth-child(1)')
				.invoke('text')
				.should('eq', `${nameOfExternalComponent}2`);
			
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > span > div > div > div > div > div > ul > div > li > ul > div > li > div:nth-child(4) > div:nth-child(2) > div > div:nth-child(1)')
				.invoke('text')
				.should('eq', `${nameOfExternalComponent}1`)
				.then(() => {
					cy.get('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > span > div > div > div > div > div > ul > div > li > ul > div > li > div:nth-child(4) > span:nth-child(3)')
						.invoke('text')
						.should('eq', 'Active ');
				});
		});

		it("Check external components", () => {
			for(let i = 1; i <= numOfExternalComponents; i++) {
				checkComponentsKB(
					`#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(${i}) > td`, 
					'#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div:nth-child(1) > div > ul > div > li > div > div.editable.enabled > span', 
					'#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div:nth-child(1) > div > ul > div > li > div > ul > div > li > span > i',
					`${descriptionOfExternalComponent}${i}`,
					referenceTextInImportedModel,
					`${nameOfExternalComponent}${i}`
				);
			}
		});

		it("Go to simulation tab", () => {
			cy.get('#app > div > div > div > div.heading.appBar > div:nth-child(2) > div.menu.menuBar.MODEL > div > ul > li.Simulation')
				.click();
		});

		it("Check simulation control panel", () => {
			// Check Simulation Speed
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(2) > div > div.content > div > div > div > div > div:nth-child(1) > div.simulation.settings > dl.speed > div > div.editable.enabled')
				.first()
				.invoke('text')
				.should('eq', '1');

			// Check Sliding Window
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(2) > div > div.content > div > div > div > div > div:nth-child(1) > div.simulation.settings > dl.window > div > div.editable.enabled')
				.invoke('text')
				.should('eq', '1');

			// Check updating
			cy.contains('Synchronous')
				.invoke('text')
				.should('eq', 'Synchronous');
		})

		it("Check External Components Activity", () => {
			for(let i = 1; i <= 1; i++){
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(1) > td.float')
					.eq((i-1))
					.invoke('text')
					.should('eq', `${nameOfExternalComponent}${i}`)
					.then(() => {
						cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(1) > td.activity > div > div.editable.enabled')
							.eq((i-1))
							.invoke('text')
							.should('eq', '0');
					});
			}
		});

		it("Go to analysis tab", () => {
			cy.get('#app > div > div > div > div.heading.appBar > div:nth-child(2) > div.menu.menuBar.MODEL > div > ul > li.Analysis')
				.click();
		});

		it("Check External Components Activity Range", () => {
			for(let i = 1; i <= numOfExternalComponents; i++){
				cy.get(`#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(${i}) > td.activity.range > div > div:nth-child(1)`)
				.invoke('text')
				.should('eq', '0');

				cy.get(`#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(${i}) > td.activity.range > div > div:nth-child(3)`)
					.invoke('text')
					.should('eq', '100');
			}
		});
	});
});
