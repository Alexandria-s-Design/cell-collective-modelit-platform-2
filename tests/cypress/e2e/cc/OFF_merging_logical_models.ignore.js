Cypress.on('uncaught:exception', (err, runnable) => {
	return false;
});

const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com";
const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm";

context('Listview', () => {
	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/'//'https://staging.cellcollective.org/';

	before(() => {
		cy.visit(URL);
	});

	it('User UI - login and merge models', () => {
			cy.get('a[class=button-three]').click({force: true});
      cy.get('li[id="signInDialogBtn"]').click({force:true})
				.then(() => {
					cy.get('input[name="username"]').filter(':visible').type(email)
					cy.get('input[name="password"]').filter(':visible').type(password)
					cy.get('button[class="btn-signin"]').click()
					cy.wait(5000)
					cy.get('span[data-translate="merge_models"]').click({force: true})
					  .then(() => {
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
					cy.get('button[data-translate="merge_selected_models"]').should('be.visible')
					cy.get('button[data-translate="cancel"]').should('be.visible')	
					cy.get('.tab-content.published .card-content .model-checkbox').first().check({ force: true });
        	cy.get('.tab-content.mymodels .card-content .model-checkbox').first().check({ force: true });
        	cy.get('.tab-content.shared .card-content .model-checkbox').first().check({ force: true });
        	cy.get('button[data-translate="merge_selected_models"]').click({force:true});
					cy.wait(60000);
					cy.get('div.toast.toast-success')
  					.contains('Click here to view')
  					.click();
          });
				})


	});
});

