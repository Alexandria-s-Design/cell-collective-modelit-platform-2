/**
 * @author: Phillip Nguyen
 * Testing if:
 * clicking a dashboard card opens the model/module on Research/Teach/Learn
 */



const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"

context('Research ModelIt! Test - Dashboard', () => {
	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' 
	beforeEach(() => {
		cy.visit(URL)
		cy.clearCookies()
		cy.reload()
		cy.get('a[class=button-three]') //go to research
		  .click({force: true})
	})

	it('Clicking on Public Modules at Dashboard (Research)', function () {
		cy.get('.bloc-tabs').find('button[id="3"]').click()
		cy.get('.content').find('a[class="button-three"]').click()
		cy.reload()
		cy.get('div[class="icon large-account menu right topRightMenu"] ul[class="ul"]').invoke('show')
			.contains('Research Platform')
			.should('be.visible')
			.click()
			.wait(10000)
		var ModelName
		cy.get('.card').first().click().url();  //Selecting the first card

		//Fetching the name of the first model on dashboard
		cy.get('.modelName').invoke('text').then((text) => {
			ModelName = text.substring(0, text.indexOf('(')).trim()  // Fetching the name of the current model, removing the model name from the string and triiming the trailing space.
			cy.get('.logoImg')
				.should('have.attr', 'src')
				.and('include', '/assets/images/logo/learning/logo.png')
				.click()  //Navigating back to the dashboard
			cy.get('.catalog > :nth-child(1)').click();  //Clicking `Published Models`

			//Asserting if the ModelName is same as the first model under the `published models` tab
			cy.get(':nth-child(1) > :nth-child(2) > .cards > span > :nth-child(1) > :nth-child(1) > .frame > .research > :nth-child(1) > :nth-child(1)').should('contains.text', ModelName)
		})
	})

	/*  it('Clicking on Public Modules at Dashboard (Teach)', function () {
				cy.get('#appbar-landing').find('a[data-toggle="dropdown"]').click()
				cy.contains('Teaching').click()
				// Navigating to Teach:
				cy.get('div[class="menu right icon large-domain topRightMenu"] ul[class="ul"]').invoke('show').contains('Teaching').click().wait(7000)
				cy.login(email, password).wait(5000)
				var ModelName
				cy.get('.card').first().click()  //Selecting the first card

				//Fetching the name of the first model on dashboard
				cy.get('.modelName').invoke('text').then((text) => {
						ModelName = text.substring(0, text.indexOf('(')).trim()  // Fetching the name of the current model, remving the model name from the string and triiming the trailing space.
						cy.get('.logoImg').click()  //Navigating back to the dashboard
						cy.get('.catalog > :nth-child(1)').click();  //Clicking `Published Models`

						//Asserting if the ModelName is same as the first model under the `published models` tab
						cy.get(':nth-child(1) > :nth-child(1) > .frame > .learning > :nth-child(1) > :nth-child(1)').should('have.text', ModelName)
				})
		})

		it('Clicking on Public Modules at Dashboard (Learn)', function () {
				cy.get('#appbar-landing').find('a[data-toggle="dropdown"]').click()
				cy.contains('Teaching').should('be.visible')
				cy.contains('Teaching').click()
				cy.get('div[class="menu right icon large-domain topRightMenu"] ul[class="ul"]').invoke('show').contains('Teaching').click().wait(7000).login(email, password).wait(5000)
				cy.get('.arrangement').get('div[class="joyride"]').invoke('hide')
				var ModelName
				cy.get('.card').first().click()  //Selecting the first card

				//Fetching the name of the first model on dashboard
				cy.get('.modelName').invoke('text').then((text) => {
						ModelName = text.substring(0, text.indexOf('(')).trim()  // Fetching the name of the current model, remving the model name from the string and triiming the trailing space.
						cy.get('.logoImg').click()  //Navigating back to the dashboard
						cy.get('.catalog > :nth-child(1)').click();  //Clicking `Published Models`

						//Asserting if the ModelName is same as the first model under the `published models` tab
						cy.get(':nth-child(1) > :nth-child(1) > .frame > .learning > :nth-child(1) > :nth-child(1)').should('have.text', ModelName)
				})
		})
*/
})
