/** 
 * @author: shivani
 * @fixBy: Akshat
 * Available through research > Simulation 
 * */

context('ModelIt! Research - Simulation External ad Internal Components', () => {
	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/'
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
	const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"

	it('Signing In', () => {
		cy.visit(URL)
		cy.get('a[class=button-three]') //go to research
		  .click({force: true})
		cy.signin(email, password)
		cy.contains('Sign Out')
			.should('exist')
			.wait(5000)
	})

	it('Filter Models and Click 1st Logical', () => {
		cy.get('.bar > span > .model-control > .menu.to-front')
			.contains('Logical')
			.click({ force: true })
			.wait(3000)
		cy.get('.view .content .card')
			.first()
			.click()
			.wait(3000)
	})

	it('Open Simulation tab', () => {
		cy.get('.menuScrollbar').find('li').contains('Simulation').click().wait(500)
		cy.wait(3000)
	})

	it('Should play simulation on simulation graph when you click play icon ', () => {
		cy.get('input[class="icon large-run"]').click()
		// Should see play icon switch to a pause icon when you click play icon
		cy.get('input[class="icon large-stop"]').should('be.visible')
		cy.get('input[class="icon large-pause"]').should('be.visible')
		cy.get('div[class="simulation control"]').should('have.text', 'Time (Step):20')
	})

	it('Should pause simulation when you click pause icon', () => {
		cy.get('input[class="icon large-pause"]').click().wait(500)
		//Should see pause icon switch to play icon when you click pause
		cy.get('input[class="icon large-stop"]').should('be.visible')
		cy.get('input[class="icon large-run"]').should('be.visible')
	})

	it('Should erase simulation from simulation graph when you click stop icon', () => {
		cy.get('input[class="icon large-stop"]').click().wait(500)
		//Should see the disabled stop icon when click stop
		cy.get('input[class="icon large-stop"]').should('be.disabled')
	})

	it('Should erase simulation from simulation graph when you click the stop icon(later)', () => {
		cy.get('input[class="icon large-run"]').click().wait(500)
		cy.get('tbody').eq(1).find('tr').then(($ICtable) => {
			for (let i = 0; i < 3; i++) {
				cy.wrap($ICtable).eq(i).find('.checkbox.visibility').find('.checkbox').click()
			}
		})
		cy.get('input[class="icon large-pause"]').click()
		cy.get('svg>g').eq(0).then(($lines) => {
			cy.wrap($lines).find('g').eq(1).should('have.class', 'sub _0')
			cy.wrap($lines).find('g').should('have.class', 'sub _1')
			cy.wrap($lines).find('g').should('have.class', 'sub _2')
			cy.get('input[class="icon large-stop"]').click()
			cy.wrap($lines).should('not.contain', '.sub._0')
			cy.wrap($lines).should('not.contain', '.sub._1')
			cy.wrap($lines).should('not.contain', '.sub._2')
		})
	});

	it('Should NOT crash when you click play to run a simulation then try to copy the model by clicking “copy” icon in right corner', () => {
		cy.get('.toolbarCss.static').find('li').eq(0).click().then(($File) => {
			cy.wrap($File).find('ul>li').eq(4).should('contain', 'Copy')
		})
	});

	it('Should change simulation speed when you click and drag circle next to simulation speed', () => {
		cy.get('div[class="simulation settings"]').find('div[style="left: 0%;"]').first()
			.trigger('mousedown', { which: 1 }).then(() => {
				cy.get('div[class="simulation settings"]').find('div[class="sliderInput"]').first()
					.trigger('mousemove', 'right').wait(100).trigger('mouseup')
			})
	});

	it('Should change simulation window when you click and drag circle next to simulation window', () => {
		cy.get('dl[class="window"]').find('div[style="left: 0%;"]').first()
			.trigger('mousedown', { which: 1 }).then(() => {
				cy.get('dl[class="window"]').find('div[class="sliderInput"]').first()
					.trigger('mousemove', 'right').wait(100).trigger('mouseup')
			})

	});

	it('Should allow you to type in a number when you click on number next to simulation speed (max speed is 10)', () => {
		cy.get('div[class="simulation settings"]').get('dl[class="speed"]').find('div[class="editable enabled"]').eq(0).click().then(() => {
			cy.get('form[class="editable menu"]').find('input[maxlength="2"]').clear().type('9{enter}')
		})
		cy.get('div[class="simulation settings"]').find('div[class="editable enabled"]').eq(0).should('have.text', '9')
	});

	it('Should allow you to type in a number when you click on number next to sliding window', () => {
		cy.get('div[class="simulation settings"]').get('dl[class="window"]').find('div[class="editable enabled"]').eq(0).click().then(() => {
			cy.get('form[class="editable menu"]').find('input[maxlength="4"]').clear().type('900{enter}')
		})
		cy.get('dl[class="window"]').get('div[class="sliderInput"]').find('div[class="editable enabled"]').eq(1).should('have.text', '900')
	});

	it('Should list initial states when you click drop down menu”', () => {
		cy.get('.options').eq(1).then(($initialState) => {
			cy.get(':nth-child(4) > dd > .options > .icon').click()
			cy.wrap($initialState).should('be.visible')
		})
	});

	//Currentlly a bug: Initial state:

	// it('Should allow you to add new initial state when you click “add initial state and change the name of the initial state when you click on the name of the initial state and type', () => {
	//     /****************** */ //copy the model and edit the copied model*******************/
	//     cy.get('.toolbarCss.static').find('li').eq(0).then(($File) => {
	//         cy.wrap($File).find('div>span').contains('File').trigger('mouseover')
	//         cy.wrap($File).find('ul>li').eq(4).find('div').click({ force: true })

	//         cy.get('.options').eq(0).then(($initialState) => {
	//             cy.wrap($initialState).find('.icon.base-menu').click()
	//             cy.wrap($initialState).find('.menu>ul').find('li').should('be.visible')
	//             cy.wrap($initialState).find('.menu>ul').find('.add-option').click()
	//             cy.wrap($initialState).find('.editable.enabled.bold').click()
	//             cy.wrap($initialState).find('.editable.menu.bold').find('input[spellcheck=false]').clear().type('testing-initialState{enter}')
	//             cy.wrap($initialState).find('.editable.enabled.bold').should('have.text', 'testing-initialState')
	//         })
	//     })
	//      })
	//         it('Should delete initial state when you click on x next to the name of initial state', () => {
	//             cy.get('.toolbarCss.static').find('li').eq(0).then(($File) => {
	//                 // cy.wrap($File).find('div>span').contains('File').trigger('mouseover')
	//                 cy.wrap($File).find('ul>li').eq(4).find('div').click({ force: true })
	//             })
	//             cy.get('img[height="34"]').click()
	//             cy.get('.catalog').find('li').eq(1).click() //nagivate to MyModels(#)
	//             cy.get('.card').eq(0).click()               //click first card
	//             cy.get('.menu.menuBar').find('ul>li').eq(1).click()
	//             cy.get('.options').eq(0).then(($initialState) => {
	//                 cy.wrap($initialState).find('.icon.base-menu').click()
	//                 cy.wrap($initialState).find('.menu>ul').find('li').should('be.visible')
	//                 cy.wrap($initialState).find('.menu>ul').find('.add-option').click()
	//                 cy.wrap($initialState).find('.editable.enabled.bold').click()
	//                 cy.wrap($initialState).find('.editable.menu.bold').find('input[spellcheck=false]').clear().type('testing-initialState{enter}')
	//                 cy.wrap($initialState).find('.icon.base-menu').click()
	//                 cy.wrap($initialState).find('.menu>ul').find('li>div').contains('testing-initialState').find('.remove').click()
	//                 cy.wrap($initialState).find('.icon.base-menu').click()
	//                 cy.wrap($initialState).find('.menu>ul').find('li>div').should('not.contain', 'testing-initialState')
	//             })
	//         })
	// it('Should have all initial states be inactive when you select “All inactive”', () => {
	//     cy.get('.options').eq(0).then(($initialState) => {
	//         cy.wrap($initialState).find('.icon.base-menu').click()
	//         cy.wrap($initialState).find('.menu>ul').find('.def').contains('All Inactive').click()
	//         cy.wrap($initialState).should('have.text', 'All Inactive')
	//     })
	// })

	// No simulation settings
	// it('Should switch to asynchronous when you select asynchronous and switch back to synchronous when you select synchronous from the drop down menu', () => {
	// 	//click the dropdown menu
	// 	cy.get('.simulation.settings').find('dd').eq(1).find('.options').then(($simulationMenu) => {
	// 		cy.wrap($simulationMenu).find('.icon.base-menu').click()
	// 		//switch to Asynchronous
	// 		cy.wrap($simulationMenu).find('.menu').find('ul>li').eq(1).contains('Asynchronous').click()
	// 		cy.wrap($simulationMenu).should('have.text', 'Asynchronous')
	// 		//switch back to Synchronous
	// 		cy.wrap($simulationMenu).find('.icon.base-menu').click()
	// 		cy.wrap($simulationMenu).find('.menu').find('ul>li').eq(0).contains('Synchronous').click()
	// 		cy.wrap($simulationMenu).should('have.text', 'Synchronous')
	// 	})
	// })

	// Calculates wrong count in legend when has external components
	// it('Should display the external components that have a checkmark next to them on the simulation graph when you click play in simulation control panel', () => {
	// 	cy.get('div[class="arrangement"]>div').eq(4).then(($graph) => {
	// 		cy.get('div[class="arrangement"]>div').eq(1).then(($extComp) => {
	// 			cy.wrap($extComp).find('tbody').its('length').then(($checkboxlength) => {
	// 				// check if there are any checkboxes
	// 				if ($checkboxlength > 0) {
	// 					cy.wrap($extComp).get('tbody').eq(0).find('tr[class]').then(($tableFunc) => {
	// 						for (var i = 0; i < $checkboxlength; i++) {
	// 							cy.wrap($tableFunc).find('td[class="checkbox visibility"]').find('span[class=checkbox]').eq(i).click()
	// 						}
	// 					})
	// 					//play and pause the simulation
	// 					cy.get('input[type=button]').get('input[class="icon large-run"]').click().wait(500)
	// 					cy.get('input[type=button]').get('input[class="icon large-pause"]').click()
	// 					//check if checked external components are being shown on the graph
	// 					cy.wrap($graph).get('g.dc-legend').find('g.dc-legend-item').should('have.length', $checkboxlength)
	// 				}
	// 				//expect nothing on graph when there are no external components
	// 				else {
	// 					cy.wrap($graph).get('g.dc-legend').find('g.dc-legend-item').should('have.length', '0')
	// 				}
	// 			})
	// 		})
	// 	})
	// })

	//**not all models have external components** therefore this test case is only valid on a special model

	// it('Should give options of external components starting with a letter when you click on search bar and type in a letter', () => {
	//     cy.get('img[height="34"]').click()//go back to home
	//     //search model "Signaling Pathway for Butanol"
	//     cy.get('.search').then(($model_search) => {
	//         cy.wrap($model_search).find('.editable.enabled.heading').click()
	//         cy.wrap($model_search).find('.editable.menu.heading').find('input[spellcheck="false"]').type('Signaling Pathway for Butanol{enter}')
	//     })
	//     cy.get('.card').first().click()
	//     //click simulation tab
	//     cy.get('.menu.menuBar').find('ul>li').eq(1).click()
	//     cy.get('div[class="search menu"]').eq(0).then(($searchMenu) => {
	//         cy.wrap($searchMenu).find('div').find('.editable.enabled.def').contains('Search').click({ force: true })
	//         cy.wrap($searchMenu).find('div').find('.editable.menu').find('input[spellcheck="false"]').type('p')
	//         cy.wrap($searchMenu).find('.clear').find('.editable.menu').find('.ul>li').should('have.length', '4')
	//     })
	// })
	// it('Should bring up external component when you click on search bar and type in external component name', () => {
	//     cy.get('img[height="34"]').click()//go back to home
	//     //search model "Signaling Pathway for Butanol"
	//     cy.get('.search').then(($model_search) => {
	//         cy.wrap($model_search).find('.editable.enabled.heading').click()
	//         cy.wrap($model_search).find('.editable.menu.heading').find('input[spellcheck="false"]').type('Signaling Pathway for Butanol{enter}')
	//     })
	//     cy.get('.card').first().click()
	//     //click simulation tab
	//     cy.get('.menu.menuBar').find('ul>li').eq(1).click()
	//     cy.get('div[class="search menu"]').eq(0).then(($searchMenu) => {
	//         cy.wrap($searchMenu).find('div').find('.editable.enabled.def').contains('Search').click({ force: true })
	//         cy.wrap($searchMenu).find('div').find('.editable.menu').find('input[spellcheck="false"]').type('pts')
	//         cy.wrap($searchMenu).find('.clear').find('.editable.menu').find('.ul>li').should('have.text', 'PTS')
	//     })
	// })

})

