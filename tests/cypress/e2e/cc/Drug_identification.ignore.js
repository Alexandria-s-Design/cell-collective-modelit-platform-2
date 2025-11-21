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

	it('Save the Model', () => {
		cy.contains("File").trigger("mouseover").then(() => {
			cy.contains("Save")
				.click()
		});

		cy.wait(5000);

    // Confirm the model was saved
    cy.contains("Save").parent().parent().should("have.class", "disabled");
		cy.get('div[class="bar"]').first().click({force: true})
	})

	it('Go to Drug Identification', () => {
		cy.get('#app > div > div > div > div.heading.appBar > div:nth-child(3) > div > ul > li.translate_ModelDashBoard_ModelMenu_DrugIdentification')
			.click()
	})

	it('Add Experiment', () => {
		for(let i = 0; i < numOfGens; i++) {
			cy.get('#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.bar > div > input.icon.base-add')
				.click()
		}
	})

	it('Experiment settings', () => {
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

	it('Add Drug in Drug List', () => {
		cy.get('#app > div > div > div > div.arrangement > div:nth-child(2) > div > div.bar > div > input.icon.base-add')
			.click()
	})
})