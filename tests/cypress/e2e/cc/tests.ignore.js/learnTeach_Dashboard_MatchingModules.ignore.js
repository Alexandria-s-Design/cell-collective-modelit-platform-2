
/*
* @author: Phillip Nguyen
*
* To check if they exist in both areas, I am going to check if the first module in Learning matches the first module in Teaching
* If there isnt a match then Cypress automatically fails the test, no need for an else case.
*/
context('Navigate to Learn and Teach Public Modules', () => {
	let learnModuleName;
	let teachingModuleName;
	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' //'https://learn.cellcollective.org/?dashboard=true#'
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNLI@gmail.com"
	const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"

	before(() => {
		cy.visit(URL)
		cy.get('a[class=button-one]') //go to learn
		  .click({force: true})
		cy.signin(email, password)
		cy.get('.arrangement').get('div[class="joyride"]').invoke('hide').wait(5000)
	})

	it('Get the first module name', () => {
		cy.get('div[class="card"]').eq(0).click(); //Selects the first module
		cy.get('span[class="modelName"]').then(($div) => {
			learnModuleName = $div.text();
		})
	})

	it('Navigate to Teaching', () => {
		cy.get('div[class="icon large-account menu right topRightMenu"] ul[class="ul"]')
			.invoke('show')
			.contains('Instructor Access')
			.should('be.visible')
			.click({ force: true })
		cy.signin(email, password).wait(5000)
	})

	it('Get the first module name', () => {
		cy.get('div.card').eq(0).click(); //Selects the first module
		cy.get('span[class="modelName"]').then(($div) => {
			teachingModuleName = $div.text();
		})
	})

	it('Check if the first module names are a match', () => {

		cy.expect(teachingModuleName).to.equal(learnModuleName)
	})
})

