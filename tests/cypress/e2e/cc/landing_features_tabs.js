
context('Features tabs / Chrome tabs testing', () => {

    beforeEach(() => {
        const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' //'https://develop.cellcollective.org/'
        cy.visit(URL)
        //cy.reload()
        //cy.url().should('contains', URL)
    })

    it('should switch to different chrome-tabs when clicked on the tabs under FEATURE RICH', () => {
        cy.get('div[class=chrome-tab-content]')
					.then(() => {
            cy.get('div[class=chrome-tab-title]')
							.contains('Model Analysis')
							.wait(500)
							.click({ force: true })
							
            cy.get('div[class=chrome-tab-title]')
							.contains('Learning Activities')
							.wait(500)
							.click({ force: true })

            cy.get('div[class=chrome-tab-title]')
							.contains('Model Building')
							.wait(500)
							.click({ force: true })

            cy.get('div[class=chrome-tab-title]')
							.contains('Publishing Models')
							.wait(500)
							.click({ force: true })
        })
    })
    it('should play the embedded youtube video when clicked', () => {
        cy.get('iframe[class=embed-responsive-item]')
					.click()
    })
})
