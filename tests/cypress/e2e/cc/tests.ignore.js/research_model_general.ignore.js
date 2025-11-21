/**
 * @author: Phillip Nguyen
 * Testing single specific model, main tools, not logged in
 * Test cases are followed the description inside CC Testing
 */

context('ModelIt! Research - Testing a Model (General)', () => {
	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' //'https://develop-research.cellcollective.org/?dashboard=true#'
	const researchURL = 'https://develop-research.cellcollective.org/'

	beforeEach(() => {
		cy.visit(URL)
		// cy.contains('Research').should('be.visible')
		// cy.contains('Research').click()
		cy.reload()
		cy.url().should('contains', URL)
		cy.get('a[class=button-three]') //go to research
		  .click({force: true})
		cy.get('div[class="icon large-account menu right topRightMenu"] ul[class="ul"]')
			.invoke('show')
			.contains('Research Platform')
			.should('be.visible')
			.click().wait(7000)
	})
	it('Clicking Models layer view', () => {
		cy.get('span[class="icon base-table checkbox"]').click().wait(3000)
		cy.contains('Name').click().should('be.visible')
		cy.contains('Description').click().should('be.visible')
		cy.contains('Author').click().should('be.visible')
		cy.contains('Created').click().should('be.visible')
		cy.contains('Updated').click().should('be.visible')
		// Switch back 
		cy.get('span[class="icon base-table checkbox checked"]').click()
	})

	it('Click into a model and go back to home page', () => {
		cy.contains('Published Models')
			.should('be.visible')
			.click()
			.wait(3000)
		cy.get('div[class="content"]').last().wait(2000).click(50, 50)
		cy.url().should('not.eq', researchURL)
		cy.get('div[class="scrollable"]').should('be.visible')
		cy.contains('Author:').should('be.visible')
		cy.contains('Created:').should('be.visible')
		cy.contains('Updated:').should('be.visible')
		cy.contains('Version:').should('be.visible')
		cy.contains('Tags').should('be.visible')
		cy.go('back').url().should('contains', researchURL).wait(500)
		cy.go('forward').url().should('not.eq', researchURL)
	})

	it('Should take you to model when you click on a model', () => {
		// type on search bar
		cy.get('div[class="editable enabled heading search"]').type("Guard Cell")
		// click on search button
		cy.get('input[class="icon large-search"]').should('be.visible').click().wait(4000)
		// click on a model
		cy.get('div[class="card"]').should('be.visible').first().click().then(() => {
			// There are 5 initial component at the begining
			cy.wait(2000)
			cy.get('div[class="arrangement"]').children().should('have.length', 5)
		})
		// cy.contains('Guard Cell').wait(5000)
		// cy.contains('Guard Cell').click().wait(500)
	})

	/*   it('Clicking into a model - Then switching in between fav views', () => {
				cy.contains('Guard Cell').wait(5000)
				cy.contains('Guard Cell').click().wait(500).then(() => {
						// Should by default have `n` components in the begining when switching view
						cy.get('div[class="arrangement"]').children().should('have.length', 5)
						cy.get('ul[class="favorites"] li:nth-child(1)').first().click().wait(100).then(() => {
								cy.get('div[class="arrangement"]').children().should('have.length', 5)
						})
						cy.get('ul[class="favorites"] li:nth-child(2)').first().click().wait(100).then(() => {
								cy.get('div[class="arrangement"]').children().should('have.length', 5)
						})
						cy.get('ul[class="favorites"] li:nth-child(3) ul[class="ul"]').invoke('show').wait(100).then(() => {
								cy.contains('Dose Response').click().wait(100).then(() => {
										cy.get('div[class="arrangement"]').children().should('have.length', 6)
								})
						})
						cy.get('ul[class="favorites"] li:nth-child(2)').first().click().wait(100).then(() => {
								cy.get('div[class="arrangement"]').children().should('have.length', 5)
						})
						cy.get('ul[class="favorites"] li:nth-child(3) ul[class="ul"]').invoke('show')
								.contains('Environment Sensitivity').click().wait(100).then(() => {
										cy.get('div[class="arrangement"]').children().should('have.length', 6)
								})
						cy.get('ul[class="favorites"] li:nth-child(4) ul[class="ul"]').invoke('show').wait(100)
								.contains('Topology').click().wait(100).then(() => {
										cy.get('div[class="arrangement"]').children().should('have.length', 5)
								})
						cy.get('ul[class="favorites"] li:nth-child(4) ul[class="ul"]').invoke('show').wait(100)
								.contains('Feedback Loops').click().wait(100).then(() => {
										cy.get('div[class="arrangement"]').children().should('have.length', 3)
								})
						cy.get('ul[class="favorites"] li:nth-child(4) ul[class="ul"]').invoke('show').wait(100)
								.contains('State Space Analysis').click().wait(100).then(() => {
										cy.get('div[class="arrangement"]').children().should('have.length', 1)
								})

						cy.get('ul[class="favorites"] li:nth-child(5)').first().click().wait(100).then(() => {
								cy.get('div[class="arrangement"]').children().should('have.length', 3)
						})
				})
		})

		it('Customizing fav views - Eye Icon', () => {
				cy.contains('Guard Cell').wait(5000)
				cy.contains('Guard Cell').click().wait(500).then(() => {
						cy.get('div[class="menu icon large-visibility"] ul').invoke('show', 'src').wait(100).then(() => {
								for (let i = 2; i <= 11; i++) {
										cy.get(`div[class="menu icon large-visibility"] ul li:nth-child(${i}) ul`).invoke('hide')
								}
								// Checking everything. For each check, a new window should appear
								var initLength = 5; var newLength = 5;
								cy.get('div[class="arrangement"]').children().should('have.length', initLength)
								// cy.get('div[class="menu icon large-visibility"] ul li:nth-child(1) ul li:nth-child(1)').click()
								for (let i = 1; i <= 6; i++) {
										cy.get(`div[class="menu icon large-visibility"] ul li:nth-child(1) ul li:nth-child(${i})`).click()
										newLength += 1
										cy.get('div[class="arrangement"]').children().should('have.length', newLength)

								}
								// Unchecking also works
								for (let i = 1; i <= 6; i++) {
										cy.get(`div[class="menu icon large-visibility"] ul li:nth-child(1) ul li:nth-child(${i})`).click()
										newLength -= 1
								}
								cy.get('div[class="arrangement"]').children().should('have.length', initLength)
								// Turn off Model customization, trigger Simulation customization
								cy.get('div[class="menu icon large-visibility"] ul li:nth-child(1) ul').invoke('hide')
								cy.get('div[class="menu icon large-visibility"] ul li:nth-child(2) ul').invoke('show')
								// const customSimulationRange = cy.get('div[class="menu icon large-visibility"] ul li:nth-child(2) ul').find('li').its('length')
								cy.get('div[class="menu icon large-visibility"] ul li:nth-child(2) ul').find('li').its('length').should('eq', 7)
								for (let i = 1; i <= 7; i++) {
										cy.get(`div[class="menu icon large-visibility"] ul li:nth-child(2) ul li:nth-child(${i})`).click()
										newLength += 1
										cy.get('div[class="arrangement"]').children().should('have.length', newLength)
								}
						})

				})
		})

		it('Customizing fav views - Layout Icon', () => {
				cy.contains('Guard Cell').wait(5000)
				cy.contains('Guard Cell').click().wait(500).then(() => {
						cy.get('div[class="menu icon large-layout"] ul').invoke('show').wait(100).then(() => {
								// All are checked initially
								cy.get('div[class="menu icon large-layout"] ul li:nth-child(2) ul').invoke('hide')
								for (let i = 1; i <= 5; i++) {
										cy.get(`div[class="menu icon large-layout"] ul li:nth-child(1) ul li:nth-child(${i}) div[class="checkbox checked"]`).should('be.visible')
								}
								// If we remove Analysis it should be gone
								cy.get('div[class="menu icon large-layout"] ul li:nth-child(1) ul li:nth-child(1)').click()
								cy.get('ul[class="favorites"]').find('Analysis').should('not.be.visible')
								cy.get('div[class="menu icon large-layout"] ul li:nth-child(1) ul li:nth-child(1)').click()
								// Addding customer layout
								cy.get('div[class="menu icon large-layout"] ul li:nth-child(1) ul li:nth-child(6)').click()
								cy.get('div[class="arrangement"]').children().should('have.length', 0)
								cy.get('div[class="menu icon large-layout"] ul li:nth-child(1) ul').invoke('hide')
								cy.get('div[class="menu icon large-layout"] ul li[class="custom selected"] div').contains('Custom Layout 1').should('be.visible')
								// Model should have 1 more options to display Custom layout 1
								cy.get('div[class="menu icon large-layout"] ul li:nth-child(1) ul').children().should('have.length', 7)
								// Should be able to remove the customize div
								cy.get('div[class="menu icon large-layout"] ul li:nth-child(1) ul').invoke('show')
								cy.get('div[class="menu icon large-layout"] ul li:nth-child(1) ul li[class="custom"] div[class="checkbox"] div[class="remove"]').click().then(() => {
										cy.get('div[class="menu icon large-layout"] ul li:nth-child(1) ul[class="ul customize"').children().should('have.length', 6)
										cy.get('div[class="arrangement"]').children().should('have.length', 5)
								})
								cy.get('div[class="menu icon large-layout"] ul').invoke('hide')
								// Restore view
								cy.get('input[class="icon large-info"]').should('be.visible').click().wait(500).then(() => {
										cy.get('div[class="arrangement"]').children().should('have.length', 5)
										// Should have 14 icons like original
										cy.get('div[class="heading"] div:nth-child(2)').children().should('have.length', 14)
								})

						})
				})
		})
*/
	it('Testing Graph Panel', () => {
		// type Guard Cell in search bar
		cy.get('div[class="editable enabled heading search"]').type("Guard Cell")
		// click on search button
		cy.get('input[class="icon large-search"]').should('be.visible').click().wait(5000)
		// click on a model
		cy.get('div[class="card"]').first().click().then(() => {
			// test graph panel
			cy.get('div[class="arrangement"] div[class="view"] div div[class="bar"] span').contains('Graph')
			cy.contains('AA').should('be.visible')
		})
	})

	/**
	 * Since user not logged in, these should all be disabled
	 
	it('Testing Save Model, Save Model Layout, Undo and Redo', () => {
			cy.contains('Guard Cell').wait(5000)
			cy.contains('Guard Cell').click().wait(500).then(() => {
					// Initially
					cy.get('input[class="icon large-save"]').should('be.disabled')
					cy.get('input[class="icon large-savelayout"]').should('be.disabled')
					cy.get('input[class="icon large-undo"]').should('be.disabled')
					cy.get('input[class="icon large-redo"]').should('be.disabled')
					// Edit a model, still won't be able to save since we haven't logged in
			})
	})

	it('Should make a copy of the model (everything should remain the same) when you click on the make a copy icon in right corner', () => {
			cy.contains('Guard Cell').wait(5000)
			cy.contains('Guard Cell').click().wait(500).then(() => {
					cy.get('input[class="icon right large-copy"]').click().wait(500).then(() => {
							// A copied model should not be able to download or share
							cy.get('div[class="icon large-download menu right').should('be.disabled')
							cy.get('div[class="icon right large-share').should('be.disabled')
							// The content after clicked copy should generate a number in url denoted by -`d`:-`d`
							const rule = '^https://.*?-[0-9]+:-[0-9]+/.*$'
							// assert.equal(new RegExp(rule).test(cy.url()), true, 'url patterns match')

					})
			})
	})
	*/
})
