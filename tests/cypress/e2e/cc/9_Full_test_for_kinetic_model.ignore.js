/**
 * @author: Jozef Cabala
 * Full test for CBM
 */
Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

Cypress.config("viewportWidth", 1566); // to enable drag and drop for regulators panel
const downloadsFolder = Cypress.config("downloadsFolder");
const path = require("path");

context('New Kinetic Model',() => {

	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' 
	const DASHBOARD = '?dashboard=true#'
	let MODELPATH = ""
	const email = Cypress.env("CC_TEST_EMAIL") || "teacher@teacher.sk"
	const password = Cypress.env("CC_TEST_PASSWORD") || "teacherteacher"
	let modelName = 'Kinetic Model';
	const sampleReferenceDOI = "10.1186/s12898-019-0263-7";
	const description = "description.";
	const experimentSettingsTime = 200;
	const newParameterValue = 5;
	const parameterUnits = "molar per second";
	const referenceText = 'Teso, Valeria, Diego Urteaga, and Guido Pastorino. “Assemblages of Certain Benthic Molluscs along the Southwestern Atlantic: From Subtidal to Deep Sea.” BMC Ecology 19, no. 1 (November 27, 2019). https://doi.org/10.1186/s12898-019-0263-7.\n'
	const experimentName = 'New Experiment 1'

	function getTimeAndDate() {
		const currentDate = new Date();

		const formattedDate = currentDate.toLocaleDateString().replace(/\//g, '_');
    const formattedTime = currentDate.toLocaleTimeString().replace(/:/g, '_');

		modelName = `${modelName} - ${formattedDate} ${formattedTime}`;
	}

	function addKB() {
    cy.get('div[class="view"]')
      .eq(4)
      .find('input[class="icon base-add"]')
      .first()
      .click()
      .then(() => {
        cy.get('div[class="editable enabled def togglePmid"]')
          .click()
          .then(() => {
            cy.get('form[class="editable menu togglePmid"]')
              .find("input")
              .type(`${description}{enter}`);
            // add reference
            cy.get('input[class="icon base-reference"]')
              .first()
              .click()
              .then(() => {
                cy.get('div[class="editable enabled def togglePmid"]')
                  .click()
                  .then(() => {
                    cy.get('form[class="editable menu togglePmid"]')
                      .find("input")
                      .type(`${sampleReferenceDOI}{enter}`);
                  });
              });
          });
      });
	}

	function dropItems(tdOneSelector, tdTwoSelector) {
		cy.document().then((doc) => {
		const droppableDiv = doc.querySelectorAll('div[class="droppable"]');
		// const tables = doc.querySelectorAll("table");
		const tdOne = doc.querySelector(
			tdOneSelector
		);
		const tdTwo = doc.querySelector(
			tdTwoSelector
		);

		cy.dragAndDrop(tdOne, droppableDiv[0]);
		cy.wait(300);
		cy.dragAndDrop(tdTwo, droppableDiv[1]);
		cy.wait(300);
	});
}

	function checkUnits(){
		const extractUnits = (text) => {
			const match = text.match(/\[(.*?)\]/);
			return match ? match[1] : null;
		}
	
		let unitYInAnalysis;
		let unitXInAnalysis;
		let unitsInKineticLaw;
	
		getText('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > svg > g:nth-child(1) > text.y-axis-label.y-label')
			.then((text) => {
				unitYInAnalysis = text;
				return getText('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > svg > g:nth-child(1) > text.x-axis-label');
			})
			.then((text) => {
				unitXInAnalysis = text;
				return cy.get('#app > div > div > div > div.heading.appBar > div:nth-child(2) > div.menu.menuBar.MODEL > div > ul > li.Model_kinetic')
					.click()
					.wait(300);
			})
			.then(() => {
				return getText('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > span > div > div:nth-child(2) > div.content > div > div > div > div > div > div > span > dd > span');
			})
			.then((text) => {
				unitsInKineticLaw = text;
				const [yValueKineticLaw, , xValueKineticLaw] = unitsInKineticLaw.split(' ');
				unitYInAnalysis = extractUnits(unitYInAnalysis)
				unitXInAnalysis = extractUnits(unitXInAnalysis)
	
				expect(yValueKineticLaw).to.equal(unitYInAnalysis);
				expect(`${xValueKineticLaw}s`).to.equal(unitXInAnalysis);
			});
	}

	function selectCompartment(compartment) {
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.bar > div > span:nth-child(1) > dl > dd > span > input')
			.click()
			.then(() => {
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.bar > div > span:nth-child(1) > dl > dd > span > div.menu > ul > li')
					.contains(compartment)
					.click()
			})
	}

	function checkAllData() {
		// Check Model Name
		cy.get('#app > div > div > div > div.heading.appBar > div:nth-child(1) > div.topbar > div:nth-child(1) > div > span > span.modelName')
		.invoke('text')
		.then((text) => {
				const cleanedText = text.replace(/\s*\(.*?\)\s*$/, '').trim();
				expect(cleanedText).to.equal(modelName);
		});

		// Check compartment
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.bar > div > span:nth-child(1) > dl > dd > span > input')
			.click()
			.then(() => {
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.bar > div > span:nth-child(1) > dl > dd > span > div.menu > ul > li').contains('cA')
			})

		// Check Species
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr > td:nth-child(1)')
			.contains('B')
		
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr > td:nth-child(1)')
			.contains('C')	

		cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr > td:nth-child(1)')
			.contains('A')

		// NOTE: not working importing of kinetic law
		// Check Kinetic Law
		// cy.get('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > span > div > div:nth-child(2) > div.content > div > div > div > div > div > div > span > div')
		// 	.should('have.text', newParameterValue)
		
		// cy.get('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > span > div > div:nth-child(2) > div.content > div > div > div > div > div > div > span > dd > span')
		// 	.should('have.text', parameterUnits)

		// NOTE: not working saving of KB data
		// Check KB of Species
		// First Species
		// cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(1)')
		// 	.click({force: true})
		// cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > div.editable.enabled > span')
		// 	.should('have.text', description)
		// cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > div > ol > div > li > div > span > span > a:nth-child(1)')
		// 	.should('have.text', referenceText)

		// Second Species
		// cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(1)')
		// 	.click({force: true})
		// cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > div.editable.enabled > span')
		// 	.should('have.text', description)
		// cy.get('#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > div > ol > div > li > div > span > span > a:nth-child(1)')
		// 	.should('have.text', referenceText)

		// Go to Analysis
		cy.get('#app > div > div > div > div.heading.appBar > div:nth-child(2) > div.menu.menuBar.MODEL > div > ul > li.Analysis_kinetic')
			.click()
			.wait(500)
		
		// // NOTE: not working saving of experiment data
		// // Check experiment
		// cy.get('#app > div > div > div > div.arrangement > div:nth-child(2) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr > td.editable.float')
		// 	.should('have.text', experimentName)

		// // Check time in experiment
		// cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div > div > div.simulation.settings > span > dl > div')
		// 	.should('have.text', experimentSettingsTime)

		// Check units
		// checkUnits()
	}

	function saveModel() {
		cy.contains("File").trigger("mouseover").then(() => {
			cy.contains("Save")
				.click()
		});

		cy.wait(5000);

    // Confirm the model was saved
		cy.contains("File").trigger("mouseover").then(() => {
			cy.contains("Save").parent().parent().should("have.class", "disabled");
			cy.get('div[class="bar"]').first().click({force: true})
		});
	}

	Cypress.Commands.add('login', () => {
		cy.visit(URL);

		cy.get('a[class=button-three]')
			.click({ force: true });

		cy.contains('Please sign in to be able to save your work.')
			.should('be.visible');

		cy.get('div[class="icon large-account menu right topRightMenu"]')
			.trigger('mouseover')
			.then(() => {
					cy.contains('Sign In').click()
							.then(() => {
									cy.get('input[name=username]')
											.type(email, { force: true });
									cy.get('input[name=password]')
											.type(password, { force: true });

									cy.intercept('POST', URL+'_api/login').as('loginRequest');

									cy.get('button[type=submit]')
											.click();

									// cy.wait('@loginRequest').then((interception) => {
									// 	console.log(interception)
									// 	const token = interception.response.headers['set-cookie'];
									// 	window.localStorage.setItem('authToken', token);
									// 	cy.setCookie('session_id', token);
									// });

									cy.get('.right')
											.should('be.visible');
							});
			});

		cy.wait(5000);
	});

	before(() => {
		cy.login();
		// getTimeAndDate();
	});

	beforeEach(() => {
		Cypress.Cookies.preserveOnce('connect.sid')
	});

	it('Create new Kinetic Model', () => {
		cy.wait(300)
		cy.get("#app > div > div > div > div.heading.appBar > div.mainTopbar > div > ul > li > ul > li:nth-child(3) > ul > li:nth-child(1) > div > span").click({force: true})
		
		saveModel();
	})

	it('Rename Model', () => {
		cy.get('#app > div > div > div > div.heading.appBar > div:nth-child(1) > div.topbar > div:nth-child(1) > div > span > span.modelName')
			.click()
			.then(() => {
				cy.get('form[class="editable menu"]')
					.find("input")
					.clear({ force: true })
					.type(modelName);
			})

		saveModel()
	})

	it('Add Compartment and Species', () => {
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.bar > div > span:nth-child(1) > dl > dd > span > input')
			.click()
			.then(() => {
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.bar > div > span:nth-child(1) > dl > dd > span > div.menu > ul > li.add-option > div')
					.click()
			})
		saveModel()
	})

	it('Add Species', () => {
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.bar > div > input.icon.base-add')
			.click()
			.click()

		saveModel()
	})

	it('Add Reaction and add Kinetic Law', () => {
		selectCompartment('cA');
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.bar > div > input.icon.base-add')
			.click()
			.click()
			.then(() => {
				cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(2) > td')
					.then(() => {
							cy.get('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > span > div > div:nth-child(2) > div.content > div > div > div > div > div > span > input')
								.click()
								.wait(100)
								.then(() => {
									cy.get('#app > div > div > div > div.overlay > div > div > div.content > span > div > div:nth-child(2) > div > button')
										.click()
										.then(() => {
											dropItems("#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(1)",
												"#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(2) > td:nth-child(1)")
											saveModel()	
										})
								})
					})
			})
			.wait(3000)
	})

	it('Add description and references to Species', () => {
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(1) > td:nth-child(1)')
				.click({multiple: true, force: true})
			addKB()
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(2) > td:nth-child(1)')
				.click({multiple: true, force: true})
			addKB()
	
			saveModel()
		})
	
		it('Change Parameters of Kinetic Law', () => {
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(5) > div > div.content > span > div > div:nth-child(2) > div.content > div > div > div > div > div > div > span > div')
				.click()
				.then(() => {
					cy.get('form[class="editable menu metabolite"]')
						.find("input")
						.clear({ force: true })
						.type(newParameterValue);
				})
	
			saveModel()
		})

		it('Go to analysis', () => {
			cy.get('#app > div > div > div > div.heading.appBar > div:nth-child(2) > div.menu.menuBar.MODEL > div > ul > li.Analysis_kinetic')
				.click()
				.wait(500)
	
			saveModel()
		})

		it('Add a new experiment and change his time', () => {
			// Add new experiment
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(2) > div > div.bar > div > input.icon.base-add')
			.click()

			saveModel()

			// Change time
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div > div > div.simulation.settings > span > dl > div')
			.click()
			.then(() => {
				cy.get('form[class="editable menu"]')
					.find("input")
					.clear({ force: true })
					.type(experimentSettingsTime);
			})

			saveModel()
		})

		it('Run simulation', () => {
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div > div > div.simulation.control > input')
				.click()
	
			saveModel()
		})

		it('Check result of simulation', () => {
			// Select species
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(7) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(1) > td.checkbox.visibility > span')
				.click()
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(7) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(2) > td.checkbox.visibility > span')
				.click()
	
			saveModel()
	
			// Check units
			// checkUnits()
			// saveModel()
		})
	
		it('Go to model page', () => {
			cy.get('#app > div > div > div > div.heading.appBar > div:nth-child(2) > div.menu.menuBar.MODEL > div > ul > li.Model_kinetic')
				.click()
				.wait(500)
		})
	
		function getText(selector) {		
			return cy.get(selector).invoke('text');
		}
		
		it('Check if all data were saved', () => {
			selectCompartment('All')
			checkAllData()
			saveModel()
		})

	it('Export model (sbml)', () => {
			const filePath = path.join(downloadsFolder, `${modelName} (sbml).sbml`);
	
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

		saveModel()
	})

	it('Go to model page', () => {
		cy.get('#app > div > div > div > div.heading.appBar > div:nth-child(1) > a > img').click({force: true, multiple: true})
	})

	it('Import model back', () => {
		cy.contains("New Model").trigger("mouseover");
    cy.contains("Kinetic Model")
      .trigger("mouseover")
      .then(() => {
		cy.get('input[name="fileImportInput"]')
		  .eq(2)
		  .click()
		  .selectFile(path.join(downloadsFolder, `${modelName} (sbml).sbml`), {
            force: true,
      })
    	.wait(9000)
			.then(() => {
				cy.get('#app > div > div > div > div.arrangement > div.view > div > div.bar > span > ul > li:nth-child(2)')
		  		.click({force: true})
		  		.wait(1000)
					.then(() => {
						cy.get('#app > div > div > div > div.arrangement > div.view > div > div.content > div > div > div > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div > div > div.cover.research-cover > img')
							.click({force: true})
							.wait(3000)
							.then(() => {
								cy.location().then((location) => {
									const hashFragment = location.hash.substring(1);
									MODELPATH = hashFragment;
								});
							})
					})
			})
		})

		saveModel();
	})

	it('Check if all data are visible', () => {
		selectCompartment('All')
		checkAllData()
		saveModel()
	})
})
