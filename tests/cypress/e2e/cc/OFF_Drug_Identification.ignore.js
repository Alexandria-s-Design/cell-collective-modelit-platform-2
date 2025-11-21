Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

Cypress.config("viewportWidth", 1566);
Cypress.config("viewportHeight", 800)

const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/research/dashboard/' //'http://localhost:5000/'

context('DI Test Suite', () => {
	before(() => {
		cy.visit(URL);

		// cy.get("#\\33 ").click();
		// cy.get("div.active-content a").click();
		// cy.location("href").should("eq", "http://localhost:5000/research/dashboard/");
		cy.contains('Please sign in to be able to save your work.')
		.should('be.visible')		

		cy.get("li:nth-of-type(2) > ul > li:nth-of-type(1) span").click({force:true});
		cy.contains("Model")
		.should('be.visible')

		cy.get("li.Analysis_metabolic").click({force:true});
		cy.get("li.translate_ModelDashBoard_ModelMenu_DrugIdentification").click({force:true});
			})

	describe('Experiment Creation', () => {
		it("Create with plus", () => {
			cy.get("div.arrangement > div:nth-of-type(2) input.base-add").click();
			cy.contains("New Experiment 1").should('be.visible')
		})

		it("Create with panel", () => {
			cy.get("div.arrangement > div:nth-of-type(2) input.base-remove").click(); //remove previous experiment

			cy.get("div:nth-of-type(3) div.content span").click();
			cy.contains("New Experiment 1").should('be.visible')
		})


		it('Change View changes visible columns', () => {
		
			cy.get('div.bar > div > div > span.icon').click();
	
			cy.get("div:nth-of-type(4) th:nth-of-type(3)").should('be.visible'); // detailed tab shows
	
			cy.get('div.bar > div > div > span.icon').click();

		})

		})
	})

	describe("Available settings", () => {
		it("Select species", () => {
			cy.get("div.settings > p:nth-of-type(1) input").click({force:true});
			cy.contains("Humans").click({force:true})
			cy.contains("Humans").should('be.visible')

			cy.get("div.settings > p:nth-of-type(1) input").click({force:true});
			cy.contains("Primate").click({force:true})
			cy.contains("Primate").should('be.visible')

			cy.get("div.settings > p:nth-of-type(1) input").click({force:true});
			cy.contains("Mouse").click({force:true})
			cy.contains("Mouse").should('be.visible')

		});
	});
	
	describe("Drug List", () => {
		it("Manual Row Addition", ()=>{
			cy.get("div:nth-of-type(4) input.base-add").click();
			cy.contains("dA").should('be.visible')

			cy.get("div:nth-of-type(4) table.selected td:nth-of-type(1)").click();
			cy.get("div.content > div > div > div:nth-of-type(2) input").type("test");

			cy.get("div:nth-of-type(4) input.base-remove").click();
			cy.get("div.content > div > div > div:nth-of-type(2) input").should('not.exist')
			
		})
		
		it("Upload List from File", () => {

			cy.fixture('drug_list.csv').as('DrugList')
			cy.get("div:nth-of-type(4) div.content input").selectFile("@DrugList", {force:true});
			cy.contains("drug_list.csv").should("be.visible")

		})		
	})

	describe("File upload", () => {
		it("Upregulated Gene list upload", () => {

			cy.fixture('UP.csv').as('UP')
			cy.get("section:nth-of-type(1) input").selectFile("@UP", {force:true});
			cy.contains("UP.csv").should("be.visible")

		})

		it("Downregulated Gene list upload", () => {

			cy.fixture('DOWN.csv').as('DOWN')
			cy.get("section:nth-of-type(2) input").selectFile("@DOWN", {force:true});
			cy.contains("DOWN.csv").should("be.visible")

		})

		describe("Advanced Settings", () => {
			it("Dropdown Menu",() => {

				cy.get("h4.hover > input").click();
				cy.contains('Knockout Method').should('be.visible')

			})
			it("Knockout Method",() => {

				cy.get("section.dge-advanced-section > p:nth-of-type(1) input").click();
				cy.contains('MOMA').should('be.visible')

			})

			it("Solver Type",() => {

				cy.get("div.uploads-settings p:nth-of-type(2) input").click();
				cy.contains('GLPK').should('be.visible')

			})

			it("Flux Ratio Up",() => {
				// cy.get("p:nth-of-type(3) div.track").click();
				// cy.contains("10").should('be.visible')

    		// cy.get("p:nth-of-type(3) div.track").click();
				// cy.contains("1").should('be.visible')
			})

			it("Flux Ratio Down",() => {
				// cy.get("p:nth-of-type(4) div.track").invoke('val','-10').trigger('change');
				// cy.contains("-10").should('be.visible')

    		// cy.get("p:nth-of-type(4) div.track").invoke('val','1').trigger('change');
				// cy.contains("1").should('be.visible')

			})
		})

		describe("Output", () => {

		})
});


	// it('Adding experiment under default and detailed view', () =>{

		

	// })
