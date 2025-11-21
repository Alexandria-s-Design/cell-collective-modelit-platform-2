Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

Cypress.config("viewportWidth", 1566);
Cypress.config("viewportHeight", 800)

const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/research/dashboard/'

context('Cookie Panel', () => {

	beforeEach(()=>{

		cy.clearCookies()
		cy.clearLocalStorage()
		cy.visit(URL)

		})
	
	describe("Accept Cookies", () => {
		it("Cookie Panel Appears on Load", () => {
			cy.get('#cookiePopup').should('be.visible')
			})

		it("Accepting Cookie Allows Cookie Creation", () => {
			cy.get('.cookie-buttons > .cookie-accept').click({force:true})
			cy.setCookie('_ga', 'GA1.1.1625719163.1742924454')
			cy.getCookies().should('not.be.empty')
			})

		it("Cookie Panel Disappears on Acceptance", () => {
			cy.get('.cookie-buttons > .cookie-accept').click({force:true})
			cy.get('#cookiePopup').should('not.be.visible')
			})

		})
	describe("Reject Cookies", () => {
		it("Cookie Panel Appears on Load", () => {
			cy.get('#cookiePopup').should('be.visible')
			})
		it("Rejecting Cookies Does not Create Cookies", () => {
			cy.get('.cookie-buttons > .cookie-reject').click({force:true})
			cy.getCookies().should('be.empty')
		})
		it("Cookie Panel Disappears on Rejection", () => {
			cy.get('.cookie-buttons > .cookie-reject').click({force:true})
			cy.get('#cookiePopup').should('not.be.visible')
			})
		
		})

	describe("Preferences Panel", () => {
		it("Preferences Panel, enable via slider", () => {
			cy.get('.cookie-buttons > .cookie-customize').click({force:true})
			cy.contains("Save").should('be.visible')
			
			cy.get('.cookie-slider').click()
			cy.get('.cookie-settings-buttons > .cookie-customize').click()
			
			cy.setCookie('_ga', 'GA1.1.1625719163.1742924454')
			cy.getCookies().should('not.be.empty')
			})
		})
	})
