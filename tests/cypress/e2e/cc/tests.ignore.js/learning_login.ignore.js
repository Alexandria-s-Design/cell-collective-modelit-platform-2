/**
 * @author: Zdenek Vafek
 * Testing learn login 
 */


context('Learning ModelIt! Test - Login', () => {
  
		const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' //learn
		const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
		const firstName = Cypress.env("CC_TEST_USERNAME") || "Test"
		const lastName = Cypress.env("CC_TEST_USERNAME") || "Test"
		const password = Cypress.env("CC_TEST_USERNAME") || "hdMHOMCPsm"
		const spassword = Cypress.env("CC_TEST_USERNAME") || "Teststests1"
		const institutionName = Cypress.env("CC_TEST_INSTITUTION") || "UNL"

    beforeEach(() => {
		cy.visit(URL)
		cy.get('a[class=button-one]') //go to learn
			.click({force: true})
		cy.clearCookies()
    })

    it('Login via test user', () => {
        cy.login(email, password)
			// cy.get('.profile')
			// 	.should('be.visible')
		cy.get('div[class=heading]')
			.get('div[class="icon large-account menu right topRightMenu"] ul')
			.invoke('show')
		cy.get('ul[class="ul"] li')
			.should('contain', 'Your Profile')
		cy.get('ul[class="ul"] li')
			.should('contain', 'Change Password')
		cy.get('ul[class="ul"] li')
			.should('contain', 'Sign Out')		
	})

	it.only('Public modules are visible', () => {
		cy.login(email, password)
		cy.wait(1000)
		cy.get('div[class="frame grid-models"]')
		  .should('be.visible')
	})

	it('Contain right logo and modules for learning', () => {
		cy.login(email, password)
		cy.get('.logoImg')
			.should('have.attr','src')
			.and('include','/assets/images/logo/learning/logo.png')	
		cy.contains('My Learning')
			.should('be.visible')	
	})

	it('Profil contain right data', () => {
		cy.login(email, password)
		cy.contains('Your Profile')
			.click({force: true})
		cy.get('input[name=email]')
			.should('have.value', email)		  
		cy.get('input[name=firstName]')
			.should('have.value', firstName)
		cy.get('input[name=lastName]')
			.should('have.value', lastName)
		cy.get('input[name=institution]')
			.should('have.value', institutionName)
		cy.contains('Course Codes')
			.should('be.visible')	
	})

	it('Try change password', () =>{
		cy.login(email, password)
		cy.contains('Change Password')
			.click({force: true})
		cy.get('.view')
			.should('be.visible')
		cy.get('input[name=cpassword]')
			.clear()
			.type(password, {force: true})	
		cy.get('input[name=password]')
			.clear()
			.type(spassword, {force: true})	
		cy.get('input[name=vpassword]')
			.clear()
			.type(spassword, {force: true})	
		cy.get('input[type=submit]')
			.click()
		cy.contains('Password successfully updated.')
			.should('be.visible')	
	})

	it('Try change password back', () =>{
		cy.login(email, spassword)
		cy.contains('Change Password')
			.click({force: true})
		cy.get('.view')
			.should('be.visible')
		cy.get('input[name=cpassword]')
			.clear()
			.type(spassword, {force: true})	
		cy.get('input[name=password]')
			.clear()
			.type(password, {force: true})	
		cy.get('input[name=vpassword]')
			.clear()
			.type(password, {force: true})	
		cy.get('input[type=submit]')
			.click()
		cy.contains('Password successfully updated.')	
			.should('be.visible')	
	})

	it('Try change login with bad password', () =>{
		cy.login(email, password)
		cy.contains('Change Password')
			.click({force: true})
		cy.get('.view')
			.should('be.visible')
		cy.get('input[name=cpassword]')
			.clear()
			.type('1111', {force: true})	
		cy.get('input[name=password]')
			.clear()
			.type(spassword, {force: true})	
		cy.get('input[name=vpassword]')
			.clear()
			.type(spassword, {force: true})	
		cy.get('input[type=submit]')
			.click()
		cy.contains('Invalid current password!')	
			.should('be.visible')	
	})
		
	it('Try change login with no password', () =>{
		cy.login(email, password)
		cy.contains('Change Password')
			.click({force: true})
		cy.get('.view')
			.should('be.visible')	
		cy.get('input[name=password]')
			.clear()
			.type(spassword, {force: true})	
		cy.get('input[name=vpassword]')
			.clear()
			.type(spassword, {force: true})	
		cy.get('input[type=submit]')
			.click()
		cy.contains("Missing required parameter 'cpassword'!")	
			.should('be.visible')	
	})	
})
