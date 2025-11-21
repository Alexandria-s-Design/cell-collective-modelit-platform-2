Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

Cypress.config("viewportWidth", 1566);
Cypress.config("viewportHeight", 800);

const URL = Cypress.env('CC_TEST_URL') || 'localhost:5000/research/dashboard/'

function moveSpecies (element) {
	cy.get('td[class="float"]').contains(element+"1")
	.then(($ref1) => {
		cy.dragAndDrop($ref1,
			"div:nth-of-type(1) > div.content > div > div > div > div > div > div > div > div > div")
	})
	
	cy.get('td[class="float"]').contains(element+"2")
	.then(($ref2)=>{
		cy.dragAndDrop($ref2, "div:nth-of-type(3) > div.content > div > div > div > div > div > div > div > div > div")
	})	

}

context('AS Test Suite', () => {
	before(() => {
		cy.visit(URL);
		cy.location("href").should("eq", "http://localhost:5000/research/dashboard/");

		cy.contains("New Model").trigger('mouseover');
		cy.get("li > ul > li:nth-of-type(1) > ul > li:nth-of-type(1) span").click({force:true});

		// cy.get('.heading > :nth-child(1) > .icon').trigger('mouseover');
		// cy.get('.ul > :nth-child(1) > div').click({force:true})

		cy.get("li.Analysis", {timeout:100000}).click({force:true});
		cy.get("li.translate_ModelDashBoard_ModelMenu_LabelAutomatedSimulation").click({force:true});
		})
	describe('UI Testing', () => {
		it("Create Experiment with Panel", () => {
			cy.get('.panel-instruction > div').click()
			cy.contains('Name:').should('be.visible')
			})
		
		it("Remove Experiment with Minus", () => {
			cy.get("div:nth-of-type(5) input.base-remove").click();
			cy.contains('Name:').should('not.exist')
			})
		
		it("Create Experiment with Plus", () => {
			cy.get("div:nth-of-type(5) input.base-add").click();
			cy.contains('Name:').should('be.visible')
			})
		
		it("Create External Component", () => {
			cy.get("div:nth-of-type(3) input.base-add").click();
			cy.get("td[class='float']").contains("A").should('exist')
			cy.get("div:nth-of-type(3) input.base-add").click();
			cy.get("td[class='float']").contains("B").should('exist')
			})
		
		it("Remove External Component", () => {
			cy.get("td[class='float']").contains("B").click({force:true});
			cy.get("div:nth-of-type(3) input.base-remove").click();
			cy.get("td[class='float']").contains("B").should('not.exist')
			})

		it("Rename External Component", () => {
			cy.get("td[class='float']").contains("A").click();
			cy.get("td[class='editable float']").contains("A").dblclick();
			cy.get("td.editing input").type("{backspace}ExtComp{enter}");
			cy.contains("ExtComp").should("be.visible")
			})

		it("Create Internal Component", () => {
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("td[class='float']").contains("A").should('exist')
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("td[class='float']").contains("B").should('exist')
			})
		
		it("Remove External Component", () => {
			cy.get("td[class='float']").contains("B").click({force:true});
			cy.get("div:nth-of-type(4) input.base-remove").click();
			cy.get("td[class='float']").contains("B").should('not.exist')
			})
		
		it("Rename Internal Component", () => {
			cy.get("td[class='editable float']").contains("A").dblclick();
			cy.get("td.editing input").type("{backspace}IntComp{enter}");
			cy.contains("IntComp").should("be.visible")
			})
		
		it("Drag External to Internal", () => {
			cy.get('td[class="float"]').contains("ExtComp")
			.then(($ref2)=>{
				cy.dragAndDrop($ref2, ".droppable")
				})	
			cy.get('div:nth-of-type(4) td').contains("ExtComp").should('exist')
			})
		
		it("Drag Internal to External", () => {
			cy.get('td[class="float"]').contains("IntComp")
			.then(($ref2)=>{
				cy.dragAndDrop($ref2, ".droppable")
				})
			cy.get('div:nth-of-type(3) td').contains("IntComp").should('exist')
			})
		
		it("External Search", () => {
			cy.get("div:nth-of-type(3) div.search > div > div").click();
			cy.get("div.search > div input").type("IntComp{Enter}");
			cy.get('td').contains("IntComp").should("exist")
			})
		
		it("External Search Not Found", () => {
			cy.get('.remove').click()
			cy.get("div:nth-of-type(3) div.search > div > div").click();
			cy.get("div.search > div input").type("wrong{Enter}");
			cy.get('td').contains("IntComp").should("not.exist")
			})
		
		it("Internal Search", () => {
			cy.get("div:nth-of-type(4) div.search > div > div").click();
			cy.get("div.search > div input").type("ExtComp{Enter}");
			cy.get('td').contains("ExtComp").should("exist")
			})
		
		it("Internal Search Not Found", () => {
			cy.get('div:nth-of-type(4) .remove').click()
			cy.get("div:nth-of-type(4) div.search > div > div").click();
			cy.get("div.search > div input").type("wrong{Enter}");
			cy.get('td').contains("ExtComp").should("not.exist")
			cy.get('div:nth-of-type(4) .remove').click()
			cy.get('div:nth-of-type(3) .remove').click()
			})
		
		it("Rename Experiment", () => {
			cy.get('.settings > :nth-child(1) > .editable').type("{selectall}{del}Exp1{enter}");
			cy.get('.heading > :nth-child(1)').click()
			cy.get('.settings > :nth-child(1) > .editable').contains('Exp1').should('be.visible')
			})
		
		it("Number of Simulations", () => {
			cy.get(':nth-child(3) > :nth-child(1) > .editable').type("{selectall}{del}50{enter}")
			cy.contains('50').should('exist')
			})
		
		it("Change Initial State", () => {
			cy.get(':nth-child(3) > :nth-child(2) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(2) > :nth-child(1)').click({force:true})
			cy.get(':nth-child(3) > :nth-child(2) > dd > .options > .icon').click()
			cy.contains("New Initial State 1")
			})

		it("Rename Initial State", () => {
			cy.get('.options > .editable').type("{selectall}{del}IS1{enter}")
			cy.contains('IS1').should('exist')
			})
		
		it("Change Updating Type", () => {
			cy.get(':nth-child(4) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(2) > div').click()
			cy.contains('Asynchronous').should('be.visible')
			})
		
		it("Change FBA Type", () => {
			cy.get(':nth-child(4) > dl > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click()
			cy.contains("Parsimonious FBA").should("exist")

			cy.get(':nth-child(4) > dl > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(4) > div').click()
			cy.contains("Geometric FBA").should("exist")
			})
		
		it("Set Range", () => {
			cy.get('.range > .options > .icon').click()
			cy.get('.sliderInput > :nth-child(1)').type('{selectall}{del}0{enter}')
			cy.get('.sliderInput > :nth-child(3)').type('{selectall}{del}50{enter}')
			})
		
		it("Add and Set Range", () => {
			cy.get('.add-option > div').click()
			cy.get(':nth-child(3) > :nth-child(1) > .sliderInput > :nth-child(1)').type('{selectall}{del}50{enter}')
			cy.get('.settings > :nth-child(3) > :nth-child(2)').click()
			cy.contains('(0-50), (50-100)').should('be.visible')
			})
		
		it("Add Sim Flow", () => {
			cy.get('.flow > dl > dd > .options > .icon').click()
			cy.get('.add-option > div').click()
			cy.contains("New Flow 1").should('exist')
			})
		
		it("Copy Sim Flow", () => {
			cy.get('.base-copy').click()
			cy.contains("New Flow 1 (1)").should("exist")
			})
	
		it("Rename Sim Flow", () => {
			cy.get(':nth-child(1) > dd > .options > .editable').type("{selectall}{del}SF1{enter}")
			cy.contains("SF1").should("exist")
			})
		
		it("Copy Experiment", () => {
			cy.get("div:nth-of-type(5) input.base-saveIcon").click();
			//ensure name kept
			cy.contains("Exp1 (1)").should('exist')
			//ensure settings kept
			cy.contains("50").should('exist')
			cy.contains("(0-50), (50-100)").should('exist')
			})
		
		it("Delete Experiment", () => {
			cy.get("div:nth-of-type(5) input.base-remove").click();
			cy.contains("Exp1 (1)").should('not.exist')
			})
		})
	})
		