/**
 * @author: Zdenek Vafek
 * Testing of searching model
 * It`s possible change value in wait function, on production it`s working without wait
 */


context('Dashboard, search spinner UI testing', () => {
    const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' 

    beforeEach(() => {
        cy.visit(URL)
        cy.url().should('contain', URL)
        cy.get('a[class=button-three]') //go to research
		      .click({force: true})
				cy.wait(10000)
    })

    it('Select the search input bar and then enter a model to search', () => {

        cy.contains('Search')
				cy.get('div[class="editable enabled heading search"]')	
					.type('a')
				cy.get('input[class="icon large-search"]')
					.type('{enter}')	
				cy.wait(10000)
				cy.contains('models found for ')
					.should('be.visible')	
    })
})
