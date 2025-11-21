/** 
 * @author: Zdenek Vafek
 * The test case for model 
**/


describe('Model', () => {

	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' //'https://cellcollective.org/'
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
	const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"


	it('Go to the model', () => {
		cy.visit(URL)
		cy.get('a[class=button-three]') //go to research
		  .click({force: true})
		cy.login(email, password)
		
		cy.get('.model-img')
		  .first()
			.click({force: true})
			.wait(2000)
		cy.get('.modelName')	
		  .should('be.visible')
	})

	it('Overview modul', () => {
		cy.get('.view').eq(0)
		  .should('be.visible')
			.should('have.attr','style')
			.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.should('be.visible')
		cy.get('.view').eq(1)
		  .should('be.visible')
			.should('have.attr','style')			
		cy.get('.view').eq(2)
		  .should('be.visible')
			.should('have.attr','style')
		cy.get('.view').eq(3)
		  .should('be.visible')
			.should('have.attr','style')	
			cy.get('.view').eq(4)
		  .should('be.visible')
			.should('have.attr','style')		
	})

	it('Check public modules', () => {
		cy.visit(URL)
		cy.get('a[class=button-three]') //go to research
		  .click({force: true})
		cy.contains('Published Models')
			.click()
		cy.wait(1000)
		cy.get('div[class="frame slider-models"]')
		  .should('be.visible')		
	})

	it('Check shared models and copy model', () => {
		cy.visit(URL)
		cy.get('a[class=button-three]') //go to research
		  .click({force: true})
		cy.login(email, password)
		cy.contains('Shared With Me')
		  .click()
		cy.wait(1000)
		cy.get('div[class="frame grid-models"]')
		  .should('be.visible')
		cy.get('div[class="cover research-cover"]')
			.click()
		cy.wait(1000)	
		cy.contains('Copy')
		  .click({force: true})
		cy.get('span[class="not-saved"]')
		  .should('be.visible')
		cy.contains('Save')
		  .click({force: true})
		cy.contains('Download')
		  .should('exist')	
		cy.contains('SBML')
		  .should('exist')
		cy.contains('Boolean Expressions')
		  .should('exist')
		cy.contains('Truth Tables')
		  .should('exist')
		cy.contains('Interaction Matrix')
		  .should('exist')		
		cy.contains('GML')
		  .should('exist')	  	  		
	})

	it('Check if copied model exist in my models', () =>{
		cy.get('a[class="cursor-pointer"]')
		  .click()
		cy.contains('My Models')
		  .click({force: true})
		cy.get('div[class="cover research-cover"]')	
		  .should('be.visible')
	})
	
	it("Deletes Model by Pressing 'Ok' ", function () {
		cy.wait(2000)
		cy.get('div[class="research"]')
		  .first()
		  .get('div[class="remove"]')//.get('div[class="remove"]')
			.first()
			.click({force: true})
		cy.get('div[class="content"]')
		  .get('input[type="submit"]')
			.click()
	})

})

