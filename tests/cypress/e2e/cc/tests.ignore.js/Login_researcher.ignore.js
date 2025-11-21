/**
 * @author: Zdenek Vafek
 * Testing the Sign In feature
 * Make sure the username is valid and "right_password" is valid
 */


describe('LoginViaResearcher', () => {

	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/'
	const right_username = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"//"dev@helikarlab.org"
	const right_password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"//"dev"
	const wrong_username = Cypress.env("CC_TEST_USERNAME") || "Wrong@gmail.com"//"dev@helikarlab.org"
	const wrong_password = "wrongUsername";

	before(() => {
		cy.visit(URL)
		cy.clearCookies()
		//cy.reload()
		//cy.url().should('contains', URL)
		cy.get('a[class=button-three]') //go to research
		   .click({force: true})
	})
	
	beforeEach(() => {
		Cypress.on('uncaught:exception', () => false)
		//cy.visit(URL)
		//cy.clearCookies()
		//cy.reload()
		//cy.url().should('contains', URL)
		//cy.get('a[class=button-three]') //go to research
		//  .click({force: true})
	})

	it.skip('Check if response status is 200', () => {
		cy.request({
			method: "POST",
			url: '_api/login',
			body: `username=${right_username}&password=${right_password}`,
			headers: {
				 'content-type': 'application/x-www-form-urlencoded',
			}
		})
		.then((resp) => {
			expect(resp.status).to.eq(200);
	  });
	})

	it('Go to the researcher URL and Sign In/login and Sign Out', () => {

		cy.visit(URL)
		cy.clearCookies()
		cy.get('a[class=button-three]') //go to research
		   .click({force: true})
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
		.then(() => {cy.contains("Sign In").click()
			.then(() => {
				cy.get('input[name=username]')
					.type(right_username, {force: true})
				cy.get('input[name=password]')
					.type(right_password, {force: true})
				cy.get('button[type=submit]')
					.click()
			cy.get('.right')
				.should('be.visible')
			})
		})
		// cy.signout()
		// cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
		// .then(() => {cy.contains("Sign Out").click()
			cy.contains('Please sign in to be able to save your work.')
				.should('be.visible')

	})

	it('checking if login works for correct username and password via auth token', () => {
		cy.visit(URL)
		cy.clearCookies()
		cy.request({
			 method: "POST",
			 url: `_api/login`,
			 body: `username=${right_username}&password=${right_password}`,
			 headers: {
					'content-type': 'application/x-www-form-urlencoded',
			 }
		}).then(
			 (resp) => {
					expect(resp.headers).to.be.an("object")
					expect(resp.headers).to.have.property("x-auth-token")
			 })
 	})


	 it('Trying Signing in - Invalid Input', () => {
		cy.visit(URL)
		cy.clearCookies()
		cy.get('a[class=button-three]') //go to research
		   .click({force: true})
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
		.then(() => {cy.contains("Sign In").click()
			.then(() => {
				cy.get('input[name=username]')
					.type('1235786', {force: true})
				cy.get('input[name=password]')
					.type(wrong_password, {force: true})
				cy.get('button[type=submit]')
					.click()
				cy.get('.error')
					.should('be.visible')
				})
				.then(() => {
					cy.on('window:load', (e) => {
						cy.get('div[class="error"]').should('have.text', 'Please use your Email Address to Sign In')
					})
				})
		})
	})

	it('Trying Signing in - Valid Email, Wrong password', () => {
		cy.visit(URL)
		cy.clearCookies()
		cy.get('a[class=button-three]') //go to research
		   .click({force: true})
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
		.then(() => {cy.contains("Sign In").click()
			.then(() => {
			cy.get('input[name=username]')
				.type(right_username, {force: true})
			cy.get('input[name=password]')
				.type(wrong_password, {force: true})
			cy.get('button[type=submit]')
				.click()
			cy.get('.error')
				.should('be.visible')
			})
			.then(() => {
				cy.on('window:load', (e) => {
					cy.get('div[class="error"]').should('have.text', 'Incorrect Email or Password')
				})
			})
		})
	})

	it('Trying Signing in - Wrong Email, Wrong password', () => {
		cy.visit(URL)
		cy.clearCookies()
		cy.get('a[class=button-three]') //go to research
		   .click({force: true})
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
		.then(() => {cy.contains("Sign In").click()
			cy.get('input[name=username]')
				.type(wrong_username, {force: true})
			cy.get('input[name=password]')
				.type(wrong_password, {force: true})
			cy.get('button[type=submit]')
				.click()
			cy.get('.error')
				.should('be.visible')
			})
			.then(() => {
				cy.on('window:load', (e) => {
					cy.get('div[class="error"]').should('have.text', 'Incorrect Email or Password')
				})
			})
		})

	it.skip('Check public modules', () => {
		cy.contains('Published Models')
			.click()
		cy.wait(1000)
		cy.get('div[class="frame slider-models"]')
		  .should('be.visible')
	})

	it.skip('Check shared models', () => {
		cy.login(email, password)
		cy.contains('Shared With Me')
		  .click()
		cy.wait(1000)
		cy.get('div[class="frame grid-models"]')
		  .should('be.visible')
	})
})
