Cypress.on('uncaught:exception', (err, runnable) => {
	return false;
});

/**
* @author : Kaustubh, Huy Vuong, Shivani, Zdenek Vafek
* This is the test of features of profile on researcher URL
*/

context('ModelIt! Research profile', () => {
	const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/'; //'https://staging.cellcollective.org/'
	const right_username = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com";
	const right_password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm";
	const wrong_email = Cypress.env("CC_TEST_WRONG_USERNAME") || "Wrong22@gmail.com";
	const wrong_password = Cypress.env("CC_TEST_WRONG_PASSWORD") || "WRONGTEST";
	const firstName = Cypress.env("CC_TEST_FIRSTNAME") || "Test";
	const lastName = Cypress.env("CC_TEST_LASTNAME") || "Test";
	const institutionName = Cypress.env("CC_TEST_INSTITUTION") || "UNL";
	const SecondfirstName = Cypress.env("CC_TEST_SECONDFIRSTNAME") || "Test1";
	const SecondlastName = Cypress.env("CC_TEST_SECONDLASTNAME") || "Test2";
	const SecondinstitutionName = Cypress.env("CC_TEST_SECONDINSTITUTION") || "VUT";

    before(() => {
      cy.visit(URL)
			cy.clearCookies()
      cy.url().should('contains', URL)
			cy.get('a[class=button-three]')
		  	.click({force: true})
    })

		beforeEach(() => {
			Cypress.Cookies.preserveOnce('connect.sid')
		})

	it('Profile shows correct values', () => {
		cy.get('li[id="signInDialogBtn"]').click({ force: true })
			.then(() => {
				cy.get('input[name="username"]').filter(':visible').type(right_username);
				cy.get('input[name="password"]').filter(':visible').type(right_password);	
				cy.get('button[data-translate="sign_in"]').click()
							.then(() => {
									cy.get('a[data-translate="my_profile"]').click({ force: true })
									cy.contains('Your Profile').click({ force: true });
									cy.get('input[name=username]').should('have.value', right_username);
									cy.get('input[name=firstName]').should('have.value', firstName);
									cy.get('input[name=lastName]').should('have.value', lastName);
									cy.get('input[name=institution]').should('have.value', institutionName);
							});
			});
	});

	it.skip('Change user data and verify the update', () => {
			cy.get('input[name=email]').clear().type(wrong_email, { force: true });
			cy.get('input[name=firstName]').clear().type(SecondfirstName, { force: true });
			cy.get('input[name=lastName]').clear().type(SecondlastName, { force: true });
			cy.get('input[name=institution]').clear().type(SecondinstitutionName, { force: true });
			cy.get('input[type=submit]').click();

			cy.get('.view').should('not.be.visible');
			cy.contains('Your Profile').click({ force: true });
			cy.get('input[name=email]').should('have.value', wrong_email);
			cy.get('input[name=firstName]').should('have.value', SecondfirstName);
			cy.get('input[name=lastName]').should('have.value', SecondlastName);
			cy.get('input[name=institution]').should('have.value', SecondinstitutionName);

			cy.get('input[name=email]').clear().type(right_username, { force: true });
			cy.get('input[name=firstName]').clear().type(firstName, { force: true });
			cy.get('input[name=lastName]').clear().type(lastName, { force: true });
			cy.get('input[name=institution]').clear().type(institutionName, { force: true });
			cy.get('input[type=submit]').click();

			cy.contains('Your Profile').click({ force: true });
			cy.get('input[name=email]').should('have.value', right_username);
			cy.get('input[name=firstName]').should('have.value', firstName);
			cy.get('input[name=lastName]').should('have.value', lastName);
			cy.get('input[name=institution]').should('have.value', institutionName);
	});
});

