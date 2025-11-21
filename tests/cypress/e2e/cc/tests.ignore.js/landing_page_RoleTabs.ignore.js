/**
 * @author: Zdenek Vafek
 * Testing tab menu when clicking tabs and buttons  
 * in the main landing page. 
 * The file is a replacement for landing_dropdown_products.
 */
 context('Landing page, tabs UI testing', () => {
	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' //'https://develop.cellcollective.org/#' 

	beforeEach(() => {
			cy.visit(URL)
			cy.clearCookies()
			cy.reload()
			
			//Use in case that the request failed with status code 500
			//its happend only on local, because the cypress was to fast for my local 
			/*
			Cypress.on('.uncaught:exception', (e, runnable) => {
				console.log('error is', e)
				console.log('runnable', runnable)
				if(e.message.includes('Things went bad')){
					return false
				}
			})
			*/
	})

	it('Product click drop down test, 3 options should be there', () => {
			cy.contains('Researcher').should('be.visible')
			cy.contains('Teacher').should('be.visible')
			cy.contains('Student').should('be.visible')
	})

	//Testing Student tab
	it('Test of Student tab', () => {

		cy.contains('Student')
			.should('be.visible')
			.click()

		cy.get('.h2').should('be.visible')

		cy.get('.storage')
			.should('be.visible')
			.should('have.attr','src')
			.and('include','/assets/img/landing/icons/storage.png')

		cy.get('.landing-sub-heading')
			.should('be.visible')	

		cy.get('.insight').should('be.visible')
			.should('be.visible')
			.should('have.attr','src')
			.and('include','/assets/img/landing/icons/insight.png')

		cy.get('.button-one')
			.should('be.visible')
			.contains('Get Started as')
			.contains('Student')
			.click()
											
		cy.get('.logoImg')
			.should('have.attr','src')
			//.and('include','/assets/images/logo/learning/logo.png')			
			//src for local	
			.and('include','/assets/images/logo/research/logo.png')					
	})

	//Testing Researcher tab
	it('Test of Researcher tab', () => {

			cy.contains('Researcher')
				.should('be.visible')
				.click()

			cy.get('.h2').should('be.visible')

			cy.get('.storage')
				.should('be.visible')
				.should('have.attr','src')
				.and('include','/assets/img/landing/icons/storage.png')

			cy.get('.landing-sub-heading')
				.should('be.visible')	

			cy.get('.insight').should('be.visible')
				.should('be.visible')
				.should('have.attr','src')
				.and('include','/assets/img/landing/icons/insight.png')

			cy.get('.button-three')
				.should('be.visible')
				.contains('Get Started as')
				.contains('Researcher')
				.click()
											
			cy.get('.logoImg')
				.should('have.attr','src')
				.and('include','/assets/images/logo/research/logo.png')
	})

			//Testing Teacher tab
	it('Test of Teacher tab', () => {

			cy.contains('Teacher')
				.should('be.visible')
				.click()

			cy.get('.h2').should('be.visible')

			cy.get('.storage')
				.should('be.visible')
				.should('have.attr','src')
				.and('include','/assets/img/landing/icons/storage.png')

			cy.get('.landing-sub-heading')
				.should('be.visible')	

			cy.get('.insight').should('be.visible')
				.should('be.visible')
				.should('have.attr','src')
				.and('include','/assets/img/landing/icons/insight.png')

			cy.get('.button-two')
				.should('be.visible')
				.contains('Get Started as')
				.contains('Teacher')
				.click()
												
			cy.get('.logoImg')
				.should('have.attr','src')
				//.and('include','/assets/images/logo/teaching/logo.png')
				//src for local	
				.and('include','/assets/images/logo/research/logo.png')				

	})

			
	
})
