/**
 * @author : Huy Vuong, Yuri Danilov, Zdenek Vafek
 * This program performs the testing of CC Model (tab). 
 * Test cases are followed the description inside CC Testing
 * Web GL init error is preventing some test cases from being tested
 */

Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

context('ModelIt! - Research - Model (tab)', () => {

	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' 
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
	const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"

	const cellAdded = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
	const tries = 4;


	before(() => {
		cy.visit(URL)
		cy.url().should('contain', URL)
		cy.get('a[class=button-three]') //go to research
			.click({force: true})
	})

	it('Clicking New Logical Model', () => {
		cy.wait(3000)
		cy.get('.menu').contains("Create")
			.first()
			.click({ force: true })
		cy.url()
			.should('contain', 'new-model')
		cy.get('.arrangement')
			.get('.view')
			.first()
			.should('exist')
	})

	it('Overview modul', () => {
		cy.get('.view').eq(0)
		  .should('be.visible')
			.should('have.attr','style')
			.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.should('be.visible')
		cy.get('.view').eq(1)
		  .should('be.visible')
			.should('have.attr','style')			
		cy.get('.view').eq(2)
		  .should('be.visible')
			.should('have.attr','style')
		cy.get('.view').eq(3)
		  .should('be.visible')
			.should('have.attr','style')	
			cy.get('.view').eq(4)
		  .should('be.visible')
			.should('have.attr','style')		
	})

	it('Open Model tab', () => {
		cy.wait(3000)
		cy.get('.menuScrollbar').find('li').contains('Model').click().wait(500)
	})

	it('Adding a new component', () => {

		for (let i = 0; i < tries; i++) {
			// Try internal, external and graph add
			cy.get('div[class="arrangement"] div[class="view"] div[class="actions"] input[class="icon base-add"]').each(($input) => {
				cy.wrap($input).click()
			})
		}

		// Sort names ascending
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('th').first().click()
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('th').first().click()

		// check internal names
		for (let i = 0; i < tries * 2; i++) {
			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
				.find('div table tbody[class="selectable"] tr td[class="float"]').eq(i).should('have.text', cellAdded[i])
		}

	})

	it('Renaming a component, Graph, Internal, External', () => {
		// Internal Component
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('div table tbody[class="selectable"] tr td').first().click().wait(100).then(() => {
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
					.find('div table[class="selected"] tbody tr td').first().click().should('have.class', 'editing float')
					.type('test')
			})
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]').find('.canvas').first().click()
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('div tbody[class="selectable"] tr td').first().should('have.text', 'Atest')
	})

	// it('Graph Panel testing', () => {
	//     // Skip the beacon, heck, who needs it
	//     cy.get('button[class="joyride-beacon"]').trigger('mouseover').then(() => {
	//         cy.contains('Skip').click()
	//     })
	//     // Add new layout
	//     cy.get('div[class="arrangement"] div[class="view"] div div[class="bar"] div[class="actions"]')
	//         .find('input[class="icon base-menu"]').click().then(() => {
	//             cy.contains('+ Add Layout').click()
	//         })
	//     // Rename layout
	//     cy.get('div[class="arrangement"] div[class="view"] div div[class="bar"] div[class="actions"]')
	//         .find('div[class="editable enabled bold"]').click().then(() => {
	//             cy.get('div[class="arrangement"] div[class="view"] div div[class="bar"] div[class="actions"]')
	//                 .find('form').should('have.class', 'editable menu bold')
	//         })
	//     // Return to default layout
	//     cy.get('div[class="arrangement"] div[class="view"] div div[class="bar"] div[class="actions"]')
	//         .find('input[class="icon base-menu"]').click().then(() => {
	//             cy.get('div[class="arrangement"] div[class="view"] div div[class="bar"] div[class="actions"]')
	//                 .find('div[class="menu"] ul li').first().click()
	//         })
	//     // We are in pencil (edit) mode
	//     cy.get('div[class="arrangement"] div').find('span[class="icon base-view checkbox checked"]').should('be.visible')
	//     cy.get('div[class="arrangement"] div').find('span[class="icon base-view checkbox checked"]').click()
	//     cy.get('div[class="arrangement"] div').find('span[class="icon base-view checkbox"]').should('be.visible')
	//     // Download
	//     cy.get('div[class="arrangement"] div').find('input[class="icon base-download"]').should('be.visible')
	//     cy.get('div[class="arrangement"] div').find('div[class="icon base-info infobox"]').trigger('mouseover')
	//     cy.get('div[class="arrangement"] div').find('div[class="content"]').first()
	//         .trigger('mousedown', { which: 1, pageX: 0, pageY: 0 })
	//         .trigger('mousemove', { which: 1, pageX: 0, pageY: 600 })
	//         .trigger('mousedown')

	// })

	it('Internal Comoponent Panel - Regulatory Mechanism and Knowledge Base', () => {
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="scrollable overflow"]')
			.eq(0)
			.find('div table tbody[class="selectable"] tr td[class="float"]').each(($iComp) => {
				cy.wrap($iComp).click()
				// Should be appear in Regulatory Mechanism
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
					.find('ul[class="regulation biologic"]')
					.should('be.visible')
				// Should be appear in Knowledge Base
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
					.find('div[class="knowledgeBase phase2-model"]')
					.should('be.visible')
			})
	})

	// it('External Comoponent Panel - Knowledge Base', () => {
	// 	cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="scrollable overflow"]')
	// 		.eq(1)
	// 		.find('div table tbody[class="selectable"] tr td[class="float"]').each(($iComp) => {
	// 			cy.wrap($iComp).click()
	// 			// Should be appear in Knowledge Base
	// 			cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
	// 				.find('div[class="knowledgeBase phase2-model"]')
	// 				.should('be.visible')
	// 		})
	// })

	it('Internal Component Panel - Searching', () => {
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('div[class="editable enabled def"]').first().click().then(() => {
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
					.find('div form[class="editable menu"]').type('A')
			})
	})

	it('External Component Panel', () => {
		var eComps_sorted = Array()
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="panel bar"] div div[class="scrollable"]')
			.find('tr td[class="float"]').each(($eComp) => {
				eComps_sorted.push($eComp.text())
			})
		for (let i = 0; i < eComps_sorted.length - 1; i++) {
			expect(eComps_sorted[i]).to.be.lessThan(eComps_sorted[i + 1])
		}
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="panel bar"] div div').should('have.class', 'scrollable')
		// Should not display any regulatory mechanism
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="panel bar"] div div[class="scrollable"]')
			.find('tr td[class="float"]').first().click().then(() => {
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
					.find('ul')
					.should('not.have.class', 'regulation biologic')
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
					.find('div[class="knowledgeBase phase2-model"]')
					.should('be.visible')
			})
	})

	it('External Component Panel - Searching', () => {
		//  cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
		//  .find('div[class="editable enabled def"]').eq(1).click().then(() => {
		//      cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
		//      .find('div form[class="editable menu"]').type('A')
		//  })
	})

	it('Regulatory Mechanism - Dragging', () => {
		// Basal Level appear when hoverd over ball icon
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div div[class="scrollable"]')
			.find('div table tbody[class="selectable"] tr td[class="float"]').first().click().then(() => {
				cy.get('div[class="arrangement"] div[class="view"] div[class="actions"]')
					.find('span[class="icon base-absentState checkbox"]')
					.should('have.attr', 'title', 'Basal Value').click().then(() => {
						cy.get('div[class="arrangement"] div[class="view"] div[class="actions"] span')
							.should('have.class', 'icon base-absentState checkbox checked')
					})
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div div[class="scrollable"]')
					.find('div table tbody[class="selectable"] tr td[class="float"]').eq(1)
					.trigger('mousedown', { which: 1 }).wait(100).then(() => {
						cy.contains('Regulatory Mechanism').trigger('mousemove', { force: true })
						cy.contains('Drop Positive Regulator')
							.trigger('mousemove', { force: true })
							.trigger('mouseup', { force: true })
					})
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div div[class="scrollable"]')
					.find('div table tbody[class="selectable"] tr td[class="float"]').eq(1)
					.trigger('mousedown', { which: 1 }).wait(100).then(() => {
						cy.contains('Regulatory Mechanism').trigger('mousemove', { force: true })
						cy.contains('Drop Negative Regulator')
							.trigger('mousemove', { force: true })
							.trigger('mouseup', { force: true })
					})
				// cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div div[class="scrollable"]')
				//     .find('div table tbody[class="selectable"] tr td[class="float"]').eq(1)
				//     .trigger('mousedown', { which: 1 }).wait(100).then(() => {
				//         cy.contains('Regulatory Mechanism').trigger('mousemove', { force: true })
				//         cy.contains('Drop to Make External', { timeout: 600000 })
				//             .trigger('mousemove', { force: true })
				//             .trigger('mouseup', { force: true })
				//             .then(() => {
				//                 cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="panel bar"] div div[class="scrollable"]')
				//                     .find('tr td[class="float"]').should('have.length', 5)
				//             })
				//     })
			})
	})

	it.skip('Regulatory Mechanism - Working on a component ', () => {		//Test should work fine, but not pass, because there are problems with regulatory mechanism. 
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]').find('.canvas').first().click()
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div div[class="scrollable"]')
			.find('div table tbody[class="selectable"] tr td[class="float"]').first().click().then(() => {
				// Clicking on state
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
					.find('ul[class="regulation biologic"] span li div:nth-child(1)>div:nth-child(1)').each(($cell) => {
						cy.wrap($cell).invoke('attr', 'class').then((prevState) => {
							cy.wrap($cell).click()
							if (prevState == 'positive') {
								cy.wrap($cell).should('have.class', 'negative')
							} else {
								cy.wrap($cell).should('have.class', 'positive')
							}
						})
					})
				// Clicking on dominance
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
					.find('ul[class="regulation biologic"] span li div:nth-child(1)')
					.find('input[value="Dominance"]').first().click().then(() => {
						cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
							.find('div[class="dominance menu"] ul li').each(($li) => {
								cy.wrap($li).click()
							})
					})
				// Condition are droppable after click (+) sign
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
					.find('ul[class="regulation biologic"] span')
					.find('div[class="droppable"]')
					.find('input[class="icon base-add"]').each(($condAdd) => {
						cy.wrap($condAdd).click()
					}).then(() => {
						cy.contains('Conditions')
						cy.contains('Drop Components Here')
						cy.contains('SubConditions')
					}).then(() => {
						cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div div[class="scrollable"]')
							.find('div table tbody[class="selectable"] tr td[class="float"]').eq(1)
							.trigger('mousedown', { which: 1 }).wait(100).then(() => {
								// cy.contains('Regulatory Mechanism').trigger('mousemove', {force: true})
								cy.contains('Drop Components Here')
									.trigger('mousemove', { force: true })
									.trigger('mouseup', { force: true }).then(() => {
										cy.contains('is Active')
										cy.contains('If/When').trigger('mouseover').then(() => {
											cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
												.find('ul[class="regulation biologic"]')
												.find('input[class="icon base-add-gray hidden"]').click().then(() => {
													// cy.contains('Active').should('be.visible').click().then(() => {
													//     cy.contains('are Inactive').click().then(() => {
													//         cy.contains('are Active').should('be.visible')
													//     })
													// })
													cy.contains('New Component').click().then(() => {
														cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
															.find('ul[class="regulation biologic"] div')
															.find('div[class="internal new"] form')
														// .type('A new String', { force: true})
													})
												})
										})
										cy.contains('If/When')
									})
							})
						// Deleting a component in subcomponent by clicking (x)
						// cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div div[class="scrollable"]')
						//     .find('div table tbody[class="selectable"] tr td[class="float"]').eq(1)
						//     .trigger('mousedown', { which: 1 }).wait(100).then(() => {
						//         // cy.contains('Regulatory Mechanism').trigger('mousemove', {force: true})
						//         cy.contains('Drop Components Here')
						//             .trigger('mousemove', { force: true })
						//             .trigger('mouseup', { force: true }).then(() => {
						//                 cy.contains('is Active')
						//                     .find('div[class="internal"]>div:nth-child(1)')
						//                     .trigger('mouseover').then(() => {
						//                         cy.contains('is Active')
						//                             .find('div[class="remove"]').click()
						//                     })
						//             })
						//     })
					})
				for (let i = 0; i < 2; i++) {
					cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
						.find('ul[class="regulation biologic"] div').first()
						.trigger('mouseover').then(() => {
							cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
								.find('ul[class="regulation biologic"] span li div')
								.find('input[class="icon base-close-gray"]').first().click()
								.wait(500)
						})
				}
			})
	})

	// it('Knowledge Base Panel', () => {
	//     cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div div[class="scrollable overflow"]')
	//         .find('div table tbody[class="selectable"] tr td[class="float"]').first().click().then(() => {
	//             cy.get('div[class="arrangement"] div[class="view"] div[class="content"]').eq(8)
	//                 .find('div[class="editable enabled"]').its('length').should('not.eq', 0)
	//             cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
	//                 .find('input[title="Add Content"]').first().click().then(() => {
	//                     cy.get('div[class="arrangement"] div[class="view"] div[class="content"]').eq(8)
	//                         .find('ul').first().find('li').its('length').should('eq', 2)
	//                     cy.get('div[class="arrangement"] div[class="view"] div[class="content"]').eq(8)
	//                         .get('div[class="scrollbar"] div').eq(1)
	//                         .then(($scrollBar) => {
	//                             cy.wrap($scrollBar).trigger('mousedown', { which: 1, pageX: 600, pageY: 100 }).wait(100)
	//                             cy.wrap($scrollBar).trigger('mousemove', { which: 1, pageX: 600, pageY: 600 })
	//                         })
	//                     cy.get('div[class="arrangement"] div[class="view"] div[class="content"]').eq(8)
	//                         .find('ul').first().find('li:nth-child(1)').then(($descriptionPanel) => {
	//                             cy.wrap($descriptionPanel).find('div[class="remove"]').trigger('mouseover')
	//                             cy.wrap($descriptionPanel).find('div[class="remove"]').click()
	//                         })
	//                     cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
	//                         .find('div[class="references"]').then(($referencesBar) => {
	//                             cy.wrap($referencesBar).find('input[class="icon base-reference"]').trigger('mouseover')
	//                             cy.wrap($referencesBar).find('input[class="icon base-reference"]').click()
	//                             cy.contains('pmid or doi').click()
	//                             cy.wrap($referencesBar).find('ol[class="references"]').find('div[class="remove"]').eq(1).click()
	//                             // cy.get('[contenteditable]')
	//                         })
	//                 })
	//         })
	// })

	it('Clear Filters', () => {
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"] div[class="search menu"] div[class="remove"]').click()
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]').find('.canvas').first().click()
	})

	it('Deleting component', () => {
		// Remove from Internal Component

		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('div table tbody[class="selectable"] tr td').first().click().wait(100).then(() => {
				cy.get('div[class="arrangement"] div[class="view"] div[class="actions"] input[class="icon base-remove"]').then(($input) => {
					for (let i = 0; i < tries * 2; i++) {
						cy.wrap($input[1]).click()
					}
				})
			})

		// Remove from External Component
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
			.find('div table tbody[class="selectable"] tr td').first().click().wait(100).then(() => {
				cy.get('div[class="arrangement"] div[class="view"] div[class="actions"] input[class="icon base-remove"]').then(($input) => {
					for (let i = 0; i < tries; i++) {
						cy.wrap($input[2]).click()
					}
				})
			})
	})

})
