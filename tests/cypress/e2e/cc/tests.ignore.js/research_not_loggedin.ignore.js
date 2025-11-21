/** 
 * @author: Shivani
 * Fixed: Zdenek Vafek
 */
context('ModelIt! Test - Logging in/Signing up', () => {
    const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' //'https://develop-research.cellcollective.org/?dashboard=true#'
    beforeEach(() => {
        cy.visit(URL)
        cy.get('a[class=button-three]') //go to research
		  .click({force: true})
		cy.clearCookies()
		cy.get('.logoImg')
			.should('have.attr','src')
			.and('include','/assets/images/logo/research/logo.png')	
    })

    it('Should have message at the top of the page "Please sign in to be able to save your work" when you are not logged into ModelIt!', () => {
        cy.get('div[class=heading]')
					.should('contain', 'Please sign in to be able to save your work.') //true
    })

    it('Should display “Sign in, Sign up” when you hover over profile icon', () => {
        cy.get('div[class=heading]')
					.get('div[class="icon large-account menu right topRightMenu"] ul')
					.invoke('show')
        cy.get('ul[class="ul"] li')
					.should('contain', 'Sign In')
        cy.get('ul[class="ul"] li')
					.should('contain', 'Sign Up')
    })

    it('should display language options when you hover over languages icon', () => {
        cy.get('.large-account')
					.invoke('show')
        cy.get('ul[class=ul] li')
					.should('contain', 'Afrikaans')
    })

    it('should change languages when you select a language', () => {
        cy.get('.large-account')
					.invoke('show')
          .get('ul[class=ul] li:nth-child(38)>div[class="checkbox"]')
					.click({ force: true })
    })
})
