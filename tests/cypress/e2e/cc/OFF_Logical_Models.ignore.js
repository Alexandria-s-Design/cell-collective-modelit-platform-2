Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

Cypress.config("viewportWidth", 1566);
Cypress.config("viewportHeight", 800)

const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/research/dashboard/'

context('LM Test Suite', () => {
	before(() => {
		cy.visit(URL);
		cy.location("href").should("eq", "http://localhost:5000/research/dashboard/");
		cy.contains('Please sign in to be able to save your work.')
		.should('be.visible')		

		cy.get("li > ul > li:nth-of-type(1) > ul > li:nth-of-type(1) span").click({force:true});
		cy.contains("Model")
		.should('be.visible')

		it("Create New Model", () => {
			cy.contains("Please sign in to be able to save your work.").should('be.visible')
			})
		})

	describe("Graph Panel", () => {

		it("Add Node with plus", () => {
			cy.get("div.arrangement > div:nth-of-type(2) input.base-add").click();
			cy.contains("Knowledge Base A").should('be.visible')
			cy.wait(100)
			cy.get("div.arrangement > div:nth-of-type(2) input.base-remove").click();
			})

		it("Add Node with panel", () => {
			cy.get('.canvas > :nth-child(2)').dblclick('topRight')
			cy.contains("Knowledge Base A").should('be.visible')
			cy.wait(100)
			})

		it("Remove Node with minus", () => {
			cy.get("div.arrangement > div:nth-of-type(2) input.base-remove").click();
			})		
		})

	describe("Internal/External Panel", () => {
		before(() => {
			//Make new file
			cy.contains("File").trigger('mouseover')
			cy.get("li:nth-of-type(1) > ul > li:nth-of-type(1) span").click({force:true});
		})

		it("Add Int Node with plus", () => {	
			cy.get("div:nth-of-type(3) input.base-add").click();
			cy.get("[class='editable float']").contains("A").dblclick();
			cy.get("td.editing input").type("{backspace}IntComp{enter}");
			cy.contains("IntComp").should("be.visible")
			})

		it("Add Ext Nodes with plus", () => {
			cy.get("div:nth-of-type(4) input.base-add").dblclick();
			cy.contains("eA").should('be.visible')
			cy.contains("eB").should('be.visible')
			})
		})
	describe("Drag and Drop", () => {
		it("Ext to Int", () => {
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.contains("eC").then(($comp) => {
				cy.dragAndDrop($comp, '.droppable')
				})
			})
			
		it("Int to Ext", () => {
			cy.contains("eC").then(($comp) => {
				cy.dragAndDrop($comp, '.droppable')
				})
			})

		it("Positive Regulator", () => {
			cy.contains("IntComp").click({force:true})
			cy.contains("eB").then(($comp) => {
				cy.dragAndDrop($comp, ".positive .droppable")
				})
			cy.contains("Conditions").should('be.visible')
			})

		it("Negative Regulator", () => {
			cy.contains("IntComp").click({force:true})
			cy.contains("eA").then(($comp) => {
				cy.dragAndDrop($comp, ".negative .droppable")
				})
			cy.get('.no-hover').should('be.visible')
			})
		})	
	describe("Knowledge Base", () => {
		it("Add Description", () => {
			cy.get('.knowledgeBase > :nth-child(1) > .icon').click()
			cy.get('li > :nth-child(1) > .editable').type("Lorem ipsum dolor sit amet{enter}")
			})
		
		it("Add Summary", () => {
			cy.get(':nth-child(4) > :nth-child(1) > .icon').click()
			cy.get(':nth-child(4) > :nth-child(2) > :nth-child(1) > li > :nth-child(1) > .editable').type("Lorem ipsum dolor sit amet again")
		})
		
		it("Reference from DOI", () =>{
			cy.get('div.references > h1 > .icon').click()
			cy.get('.references > li > :nth-child(1) > .editable').type("https://doi.org/10.1126/science.171.3974.907{enter}")
			cy.get('.heading > :nth-child(1)').click()
			cy.wait(1000)
			cy.contains("Fork").should('be.visible')
			})

		it("Reference from PMID", () =>{
			cy.get('div.references > h1 > .icon').click()
			cy.get('.references > :nth-child(1) > :nth-child(1) > .editable').type("39787217")
			cy.get('.heading > :nth-child(1)').click()
			cy.wait(1000)
			cy.contains("acid").should('be.visible')
			})
		})
	describe("Conditions and Expression", () => {
		it("Add Condition", () => {
			cy.get('.phase1-model3 > .content > :nth-child(1) > .scrollable > [style="margin-top: 0px;"] > .regulation > :nth-child(1) > li > .droppable > .icon').click()
			cy.contains("eC").then(($comp) => {
				cy.dragAndDrop($comp, ":nth-child(4) > .droppable")
				})
			cy.contains("If/When").should("be.visible")
			})
		
		it("Toggle Activity", () => {
			cy.get('li.condition > :nth-child(4) > :nth-child(3)').click()
			cy.contains("Inactive").should("be.visible")
			})

		it("Expression Panel", () => {
			cy.contains("Insert").trigger('mouseover')
			cy.contains("Panel").trigger('mouseover')
			cy.get("li:nth-of-type(2) > ul > li:nth-of-type(2) > ul > li:nth-of-type(1) > div").trigger('mouseover');
			cy.get(':nth-child(5) > .checkbox').click({force:true})

			cy.get('.expression').contains("eB")
			})
		})
	
	describe("Simulation Tab", () => {
		
		it("Navigate to Simulation Tab", () => {
			cy.contains("Insert").click({force:true})
			cy.get('.Simulation').click({force:true})
		})
		
		it("Make Components Visible", () => {
			cy.get('.selectable > :nth-child(1) > .visibility > .checkbox').dblclick()
			cy.get(':nth-child(2) > .visibility > .checkbox').dblclick()
			cy.get(':nth-child(3) > .visibility > .checkbox').dblclick()

		})

		it("Toggle Max Activity", () => {
			cy.get('.activity > :nth-child(1) > input').click()
			cy.contains("100").should('be.visible')
			cy.get('.activity > :nth-child(1) > input').click()
		})

		it("Change Activity Levels", () => {
			cy.get('.selectable > :nth-child(1) > .activity > .sliderInput > .track > :nth-child(1)').click('right')
			cy.get(':nth-child(2) > .activity > .sliderInput > .track > :nth-child(1)').click()
		})

		it("Run/Pause/Stop Simulation", () => {
			cy.get('.large-run').click()
			cy.wait(3000)
			cy.get('.large-pause').click()
			cy.wait(700)
			cy.get('.large-run').click()
			cy.wait(3000)
			cy.get(".large-stop").click()
		})

		it("Simulation Settings", () => {
			//Simulation speed
			cy.get('.speed > .sliderInput > .track').click()
			cy.get('.large-run').click()
			cy.wait(3000)
			cy.get(".large-stop").click()
			
			cy.get('.speed > .sliderInput > .track').click("right")
			cy.get('.large-run').click()
			cy.wait(3000)
			cy.get(".large-stop").click()

			//Sliding window
			cy.get('.window > .sliderInput > .track > :nth-child(1)').click()
			cy.get('.large-run').click()
			cy.wait(3000)
			cy.get(".large-stop").click()

			cy.get('.window > .sliderInput > .track > :nth-child(1)').click("right")
			cy.get('.large-run').click()
			cy.wait(3000)
			cy.get(".large-stop").click()
		})
	})
	})