/**
 * @author: Huy Vuong, Yuri Danilov
 * This test suites contains test cases for Analysis tab
 * Available through research > Analysis
 */

describe('Research - Analysis (tab)', () => {

	const URL = Cypress.env('CC_TEST_URL') ||  'http://localhost:5000/' //'https://develop-research.cellcollective.org/?dashboard=true#'
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
	const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"

	it('Signing In', () => {
		cy.visit(URL)
		cy.get('a[class=button-three]') //go to research
		  .click({force: true})
		cy.signin(email, password)
		cy.contains('Sign Out')
			.should('exist')
		cy.wait(3000)
	})

	it('Load Model and Open Analysis tab', () => {
		cy.get('.card').first().click().wait(2000)
		cy.get('.Analysis_metabolic').click().wait(500)
	})

	it('Experiment Panel', () => {
		cy.get('div[class="bar"]').first().then(($expr) => {
			cy.wrap($expr).contains('Experiment')
			for (let i = 1; i <= 6; i++) {
				cy.wrap($expr).find('input[class="icon base-add"]').click().then(() => {
					cy.contains(`New Experiment ${i}`).should('be.visible')
				})
			}
			for (let i = 1; i <= 3; i++) {
				cy.wrap($expr).find('input[class="icon base-remove"]').click().then(() => {
					cy.get('div[class="content"]')
						.find('table>tbody[class="selectable"]').first()
						.find('tr').its('length').should('eq', 6 - i)
				})
			}
			cy.wrap($expr).find('input[class="icon base-copy"]').then(($copy) => {
				cy.wrap($copy).should('have.attr', 'title', 'Copy')
				for (let i = 1; i <= 3; i++) {
					cy.wrap($copy).click()
					cy.contains(`New Experiment 3 (${i})`)
				}
			})
			let i = 0;
			cy.get('div[class="content"]')
				.find('table>tbody[class="selectable"]').first()
				.find('tr').each(($createdExpr) => {
					cy.wrap($createdExpr).find('td[class="checkbox selection"]').should('be.visible')

					cy.wrap($createdExpr).find('span[class="checkbox"]').click({ force: true })
					i++
					if (i % 2) {
						cy.wrap($createdExpr).find('span[class="checkbox checked"]').click({ force: true })
					}
				})
			cy.wrap($expr).find('input[class="icon base-run"]').click()
			cy.get('div[class="search menu"]').eq('0').find('div[class="editable enabled def"]').click()
			cy.get('div[class="simulation control"]').find('input').click().wait(500)
			cy.get('div[class="simulation control"]').children().should('have.length', 3)
		})
	})

	it('Experiment Setting Panel', () => {
		cy.get('div[class="bar"]').find('input[class="icon base-add"]').click()
		cy.get('div[class="content"]')
			.find('table>tbody[class="selectable"]').first()
			.find('tr').first().find('span[class="checkbox"]').click({ force: true })
		cy.get('div[class="bar"]').find('input[class="icon base-run"]').click().wait(1000)
		cy.get('div[class="arrangement"]>div').eq(1).within(($exprSetting) => {
			cy.contains('Completed').should('be.visible')
			cy.contains('Elapsed').should('be.visible')
			cy.wrap($exprSetting).find('input[class="icon base-download"]')
				.should('be.visible').and('have.attr', 'type', 'button')
			cy.contains('New Experiment').click()
			cy.get('form[class="editable menu bold"]')
		})
	})

	it('Flux Control Panel', () => {
		cy.get('div[class="arrangement"]>div').eq(2).within(($exprSetting) => {
			cy.contains('Sub System').should('be.visible')
			cy.contains('Env').should('be.visible')
		})
	})

	it('Gene Control Panel', () => {
		cy.get('div[class="arrangement"]>div').eq(3).within(($exprSetting) => {
			cy.contains('Gene Control').should('be.visible')
			cy.get('.actions').should('be.visible')
		})
	})

	it('Graph Panel', () => {
		cy.get('div[class="arrangement"]>div').eq(4).within(($exprSetting) => {
			cy.get('canvas').should('be.visible')
			cy.get('.actions').should('be.visible')
		})
	})

	it('Results Panel', () => {
		cy.get('div[class="arrangement"]>div').eq(5).within(($exprSetting) => {
			cy.contains('Results').should('be.visible')
			cy.get('.actions').should('be.visible')
		})
	})

})
