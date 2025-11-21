Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

context('Listview', () => {

	const URL = Cypress.env('CC_TEST_URL') ||  'http://localhost:5000/'
 
    before(() => {
      cy.visit(URL)
			cy.clearCookies()
			cy.clearAllLocalStorage()
			cy.clearAllSessionStorage()
			cy.get('a[class=button-three]')
			  .click({force: true})  
    })

		it('Filter Logical models', () => {
			cy.get('div[data-translate="model_boolean"]').click({force:true})
			cy.contains('metabolic', { matchCase: false }).then($element => {
				if ($element.length > 0) {
					cy.wrap($element).should('not.be.visible');
				} else {cy.log('not exist');}
			});
			cy.contains('kinetic', { matchCase: false }).then($element => {
				if ($element.length > 0) {
					cy.wrap($element).should('not.be.visible');
				} else {cy.log('not exist');}
			});
			cy.get('div[data-translate="no_filter"]').click({force:true})
		})

		it('Filter CBM', () => {
			cy.get('div[data-translate="model_metabolic"]').click({force:true})
			cy.contains('boolean', { matchCase: false }).then($element => {
				if ($element.length > 0) {
					cy.wrap($element).should('not.be.visible');
				} else {cy.log('not exist');}
			});
			cy.contains('kinetic', { matchCase: false }).then($element => {
				if ($element.length > 0) {
					cy.wrap($element).should('not.be.visible');
				} else {cy.log('not exist');}
			});
			cy.get('div[data-translate="no_filter"]').click({force:true})
		})

		it('Filter Kinetic models', () => {
			cy.get('div[data-translate="model_kinetic"]').click({force:true})
			cy.contains('boolean', { matchCase: false }).then($element => {
				if ($element.length > 0) {
					cy.wrap($element).should('not.be.visible');
				} else {cy.log('not exist');}
			});
			cy.contains('metabolic', { matchCase: false }).then($element => {
				if ($element.length > 0) {
					cy.wrap($element).should('not.be.visible');
				} else {cy.log('not exist');}
			});
			cy.get('div[data-translate="no_filter"]').click({force:true})
		})
	})
		
