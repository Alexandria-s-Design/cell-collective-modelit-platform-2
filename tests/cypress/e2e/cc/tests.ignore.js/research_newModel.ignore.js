/**
 * @author: Phillip Nguyen
 * Test for making new models in Research for New Model
 */


describe('Should bring up a new model when you click on plus sign next to new model', function () {
	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' //'https://develop-research.cellcollective.org/'
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
	const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"

	before(() => {
		cy.visit(URL)
		cy.get('a[class=button-three]') //go to research
		  .click({force: true})
		cy.get('.bloc-tabs').find('button[id="3"]').click()
		cy.get('.content').find('a[class="button-three"]').click()
		cy.reload()
		cy.get('div[class="icon large-account menu right topRightMenu"] ul[class="ul"]').invoke('show').contains('Research Platform').click()
		cy.get('div[class="icon large-account menu right topRightMenu"] ul[class="ul"]').invoke('show').login(email, password)
		cy.get('div[class="icon large-account menu right topRightMenu"] ul[class="ul"]').invoke('hide').wait(2000)

	})

	//Create New Model
	it('Create New Model', function () {
		// cy.get('.arrangement').get('div[class="joyride"]').invoke('hide')
		cy.get('div[class="menu"] ul[class="toolbarCss static"] li ul').invoke('show')
			// ul[class="toolbarCss static"]
			.contains('Create').click()
		// Save New Model
		cy.get('div[class="menu"] ul[class="toolbarCss static"] li').first().find('ul').invoke('show')
			.find('li').eq(1).click()
		cy.get('div[class="menu"] ul[class="toolbarCss static"] li').first().find('ul').invoke('hide')
	})

	it('Navigate to User Model Dashboard by clicking CC logo', function () {
		cy.get('a[class="cursor-pointer"]').click();
		cy.get('div[class="bar"]>span>ul>li').eq(2).click().wait(4000)
	})

	// The account needs to be cleared of multiple models. After the test case is run, the model WILL be deleted.
	it("Deletes Model by Pressing 'Ok' ", function () {
		cy.get('div[class="remove"]').first().click();
		cy.get('div[class="content"]').get('input[type="submit"]').click()
	})
})



