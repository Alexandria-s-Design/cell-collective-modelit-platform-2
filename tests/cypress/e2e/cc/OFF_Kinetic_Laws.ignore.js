Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

Cypress.config("viewportWidth", 1566);
Cypress.config("viewportHeight", 800);

const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/'

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

describe('KL Test Suite', () => {
	
	context('Law Creation', () => {
		before(() => {
			cy.visit(URL);
	
			cy.get("#\\33 ").click();
			cy.get("div.active-content a").click();
			cy.location("href").should("eq", "http://localhost:5000/research/dashboard/");
			cy.contains('Please sign in to be able to save your work.')
			.should('be.visible')		
	
			cy.get("li:nth-of-type(3) > ul > li:nth-of-type(1) span").click({force:true});
			cy.contains("Model")
			.should('be.visible')

			cy.wait(1000)

			//Make new file
			cy.contains("File").trigger('mouseover')
			cy.get("li:nth-of-type(1) > ul > li:nth-of-type(1) span").click({force:true});

			//Refresh Species Panel to allow for adding species
			cy.contains("Insert").trigger('mouseover')
			cy.contains("Panel").trigger('mouseover')
			cy.get("li:nth-of-type(2) > ul > li:nth-of-type(2) > ul > li:nth-of-type(1) > div").trigger('mouseover');
			cy.get("li:nth-of-type(1) li:nth-of-type(2) > div").dblclick({force:true});

			cy.get("div:nth-of-type(4) input.base-add").click();
		})

		it("Constant Rate", () => {
	
			//Add Reaction
			cy.get("div:nth-of-type(4) table.selected td").click();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Constant Rate{enter}");
			cy.wait(100)

			//Add Species
			cy.get("[class='editable float']").contains("A").dblclick();
			cy.get("td.editing input").type("{backspace}CR1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.wait(1000)

			cy.get("[class='float']").contains("B").dblclick();
			cy.get("td.editing input").type("{backspace}CR2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("CR")

			//Change Parameters
			cy.get("div:nth-of-type(2) > div.content > div > div > div > div > div > div div").click();
			cy.get("form > input").type("{backspace}5{enter}");
			cy.get("div:nth-of-type(5) div.content input").click();
			cy.get(".ul > :nth-child(3) > div").click({force:true});

		})

		it("Linearized Rate Law", () => {
				
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Linearized Rate Law{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}LRL1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}LRL2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Linearized Rate Law").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Move Species
			moveSpecies('LRL')

			//Change parameters
			cy.get("div:nth-of-type(2) > div.content > div > div > div > div > div > div:nth-of-type(1) div").click();
			cy.get("form > input").type("{backspace}2");
			cy.get("div.content > div > div > div > div > div > div:nth-of-type(2) div").click();
			cy.get("form > input").type("{backspace}1");
			cy.get("span > div > div:nth-of-type(2) div:nth-of-type(3) div").click();
			cy.get("form > input").type("5");

			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > dd > .options > .icon').click();
			cy.get('.ul > :nth-child(3) > div').click({force:true})
			cy.get(':nth-child(3) > :nth-child(1) > dd > .options > .icon').click();
			cy.get('.ul > :nth-child(4) > div').click({force:true})
		})

		it("Irreversible Mass-Action", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Irreversible Mass-Action{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}IMA1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}IMA2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Irreversible Mass-Action").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("IMA")

			//Change Parameters
			cy.get("div:nth-of-type(2) > div.content > div > div > div > div > div > div div").click();
    	cy.get("form > input").type("{backspace}3");
			
		})

		it("Reversible Mass-Action", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Reversible Mass-Action{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}RMA1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}RMA2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Reversible Mass-Action").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("RMA")

			//Change Parameters
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .editable').click();
    	cy.get("form > input").type("{backspace}3");
			cy.get('.reaction > :nth-child(1) > :nth-child(2) > :nth-child(1) > .editable').click();
    	cy.get("form > input").type("{backspace}4");
		})

		it("Modified Reversible Mass-Action", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Modified Reversible Mass-Action{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}MRMA1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}MRMA2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Modified Reversible Mass-Action").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("MRMA")

			//Change Parameters
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .editable').click()
			cy.get("form > input").type("{backspace}3");
			cy.get('.reaction > :nth-child(1) > :nth-child(2) > :nth-child(1) > .editable').click()
			cy.get("form > input").type("{backspace}9");
			cy.get(':nth-child(3) > :nth-child(1) > .editable').click()
			cy.get("form > input").type("{backspace}12");
			cy.get(':nth-child(4) > :nth-child(1) > .editable').click()
			cy.get("form > input").type("{backspace}3");

		})

		it("Irreversible Michaelis-Menten", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Irreversible Michaelis-Menten{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}IMM1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}IMM2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Irreversible Michaelis-Menten").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("IMM")

			//Change parameters
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .editable').type("{backspace}5")
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})

			cy.get('.reaction > :nth-child(1) > :nth-child(2) > :nth-child(1) > .editable').type('{backspace}2')
			cy.get(':nth-child(2) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})
		})

		it("Hill Equation", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Hill Equation{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}HE1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}HE2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Hill Equation").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("HE")

			//Change Parameters
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .editable').type("{backspace}5")
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})
			
			cy.get('.reaction > :nth-child(1) > :nth-child(2) > :nth-child(1) > .editable').type("{backspace}9");
			cy.get(':nth-child(2) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})

			cy.get(':nth-child(3) > :nth-child(1) > .editable').type("{backspace}12");
			
		})

		it("Simple Enzyme Product Inhibition", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Simple Enzyme Product Inhibition{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}SEPI1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}SEPI2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Simple Enzyme Product Inhibition").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("SEPI")

			//Change Parameters
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .editable').type("{backspace}5")
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})
			
			cy.get('.reaction > :nth-child(1) > :nth-child(2) > :nth-child(1) > .editable').type("{backspace}9");
			cy.get(':nth-child(2) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})

			cy.get(':nth-child(3) > :nth-child(1) > .editable').type("{backspace}12");
			cy.get(':nth-child(3) > :nth-child(1) > dd > .options > .icon').click();
			cy.get('.ul > :nth-child(4) > div').click({force:true})
		})

		it("Competitive Inhibitor", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Competitive Inhibitor{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}CI1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}CI2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Competitive Inhibitor").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("CI")

			//Change Parameters
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .editable').type("{backspace}8")
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})
			
			cy.get('.reaction > :nth-child(1) > :nth-child(2) > :nth-child(1) > .editable').type("{backspace}4");
			cy.get(':nth-child(2) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})

			cy.get(':nth-child(3) > :nth-child(1) > .editable').type("{backspace}2");
			cy.get(':nth-child(3) > :nth-child(1) > dd > .options > .icon').click();
			cy.get('.ul > :nth-child(4) > div').click({force:true})
		})

		it("Non-Competitive Inhibitor", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Non-Competitive Inhibitor{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}NCI1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}NCI2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Non-competitive Inhibitor").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("NCI")
			
			//Change Parameters
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .editable').type("{backspace}1")
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})
			
			cy.get('.reaction > :nth-child(1) > :nth-child(2) > :nth-child(1) > .editable').type("{backspace}8");
			cy.get(':nth-child(2) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})

			cy.get(':nth-child(3) > :nth-child(1) > .editable').type("{backspace}1");
			cy.get(':nth-child(3) > :nth-child(1) > dd > .options > .icon').click();
			cy.get('.ul > :nth-child(4) > div').click({force:true})
		})
		
		it("Uncompetitive Inhibitor", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Uncompetitive Inhibitor{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}UI1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}UI2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Uncompetitive Inhibitor").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("UI")

			//Change Parameters
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .editable').type("{backspace}7")
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})
			
			cy.get('.reaction > :nth-child(1) > :nth-child(2) > :nth-child(1) > .editable').type("{backspace}6");
			cy.get(':nth-child(2) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})

			cy.get(':nth-child(3) > :nth-child(1) > .editable').type("{backspace}3");
			cy.get(':nth-child(3) > :nth-child(1) > dd > .options > .icon').click();
			cy.get('.ul > :nth-child(4) > div').click({force:true})
		})

		it("Uni-Uni Reversible Michaelis-Menten", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Uni-Uni Reversible Michaelis-Menten{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}UURMM1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}UURMM2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Uni-Uni Reversible Michaelis-Menten").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("UURMM")

			//Change Parameters

			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .editable').type("{backspace}3")
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})
			
			cy.get('.reaction > :nth-child(1) > :nth-child(2) > :nth-child(1) > .editable').type("{backspace}6");
			cy.get(':nth-child(2) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})

			cy.get(':nth-child(3) > :nth-child(1) > .editable').type("{backspace}12");
			cy.get(':nth-child(3) > :nth-child(1) > dd > .options > .icon').click();
			cy.get('.ul > :nth-child(4) > div').click({force:true})

			cy.get(':nth-child(4) > :nth-child(1) > .editable').type("{backspace}3");
			cy.get(':nth-child(4) > :nth-child(1) > dd > .options > .icon').click();
			cy.get('.ul > :nth-child(4) > div').click({force:true})

		})

		it("Reversible Haldane Michaelis-Menten", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Reversible Haldane Michaelis-Menten{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}RHMM1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}RHMM2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Reversible Haldane Michaelis-Menten").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("RHMM")

			//Change Parameters
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .editable').type("{backspace}3")
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})
			
			cy.get('.reaction > :nth-child(1) > :nth-child(2) > :nth-child(1) > .editable').type("{backspace}6");
			cy.get(':nth-child(2) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})

			cy.get(':nth-child(3) > :nth-child(1) > .editable').type("{backspace}12");
			cy.get(':nth-child(3) > :nth-child(1) > dd > .options > .icon').click();
			cy.get('.ul > :nth-child(4) > div').click({force:true})

			cy.get(':nth-child(4) > :nth-child(1) > .editable').type("{backspace}3");

		})

		it("Hill Equation w/ Half-Maximal Activity", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Hill Equation Half-Maximal{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}HEH1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}HEH2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Hill Equation using Half-Maximal Activity").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("HEH")

			//Change Parameters
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .editable').type("{backspace}5")
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})
			
			cy.get('.reaction > :nth-child(1) > :nth-child(2) > :nth-child(1) > .editable').type("{backspace}9");
			cy.get(':nth-child(2) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})

			cy.get(':nth-child(3) > :nth-child(1) > .editable').type("{backspace}12");
		})

		it("Simplified Irreversible MWC Model", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Simplified Irreversible MWC Model{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}SIMWC1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}SIMWC2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Simplified Irreversible MWC Model").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("SIMWC")

			//Change Parameters
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .editable').type("{backspace}3")
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})
			
			cy.get('.reaction > :nth-child(1) > :nth-child(2) > :nth-child(1) > .editable').type("{backspace}6");
			cy.get(':nth-child(2) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})

			cy.get(':nth-child(3) > :nth-child(1) > .editable').type("{backspace}12");

			cy.get(':nth-child(4) > :nth-child(1) > .editable').type("{backspace}3");

		})

		it("Irreversible MWC Model", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Irreversible MWC Model{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}IMWCM1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}IMWCM2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Irreversible MWC Model").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("IMWCM")

			//Change Parameters
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .editable').type("{backspace}3")
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})
			
			cy.get('.reaction > :nth-child(1) > :nth-child(2) > :nth-child(1) > .editable').type("{backspace}6");
			cy.get(':nth-child(2) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})

			cy.get(':nth-child(3) > :nth-child(1) > .editable').type("{backspace}12");

			cy.get(':nth-child(4) > :nth-child(1) > .editable').type("{backspace}3");

		})

		it("Lin-Log Approximation", () => {
			//Add Reaction
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.get("div:nth-of-type(4) table:nth-of-type(1) tr:nth-of-type(1) > td").dblclick();
			cy.get("div:nth-of-type(4) div.scrollable input").type("{backspace}Lin-Log Approximation{enter}");
			cy.wait(100)

			//Add Species
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}LLA1");
			
			cy.get("div:nth-of-type(6) input.base-add").click();
			cy.get("div:nth-of-type(6) table:nth-of-type(1) tr:nth-of-type(1) > td:nth-of-type(1)").dblclick();
			cy.get("td.editing input").type("{backspace}LLA2{enter}");

			//Add Law
			cy.get("div:nth-of-type(5) div.bar input.base-add").click();
			cy.get('ul').contains("Lin-Log Approximation").click();
			cy.get("div.overlay button").click();
			cy.wait(100)

			//Drag Species
			moveSpecies("LLA")

			//Change Parameters
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > .editable').type("{backspace}3")
			cy.get(':nth-child(1) > :nth-child(1) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})
			
			cy.get('.reaction > :nth-child(1) > :nth-child(2) > :nth-child(1) > .editable').type("{backspace}6");
			cy.get(':nth-child(2) > :nth-child(1) > dd > .options > .icon').click()
			cy.get('.ul > :nth-child(3) > div').click({force:true})

			cy.get(':nth-child(3) > :nth-child(1) > .editable').type("{backspace}12");
			cy.get(':nth-child(3) > :nth-child(1) > dd > .options > .icon').click();
			cy.get('.ul > :nth-child(4) > div').click({force:true})

			cy.get(':nth-child(4) > :nth-child(1) > .editable').type("{backspace}3");

			cy.get(':nth-child(5) > :nth-child(1) > .editable').type("{backspace}3");
			cy.get(':nth-child(5) > :nth-child(1) > dd > .options > .icon').click();
			cy.get('.ul > :nth-child(4) > div').click({force:true})
		})
		})
})
