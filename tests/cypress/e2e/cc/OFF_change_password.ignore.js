Cypress.on('uncaught:exception', (err, runnable) => {
	return false;
});

/**
* @author : Kaustubh, Huy Vuong, Shivani, Zdenek Vafek
* This is the test of features of profile on researcher URL
*/

context('ModelIt! Research profile', () => {
	const URL = Cypress.env('CC_TEST_URL') || 'https://staging.cellcollective.org/' //'http://localhost:5000/'; //
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
			//Cypress.Cookies.preserveOnce('connect.sid')
			cy.visit(URL)
			cy.clearCookies()
      cy.url().should('contains', URL)
			cy.get('a[class=button-three]')
		  	.click({force: true})
		})

	it('Profile change password', () => {
		cy.get('li[id="signInDialogBtn"]').click({ force: true })
			.then(() => {
				cy.get('input[name="username"]').filter(':visible').type(right_username);
				cy.get('input[name="password"]').filter(':visible').type(right_password);	
				cy.get('button[data-translate="sign_in"]').click()
							.then(() => {
									cy.wait(5000)
									cy.get('a[data-translate="change_password"]').click({force:true})
									cy.get('input[name="cpassword"]').filter(':visible').type(right_password)
									cy.get('input[name="password"]').filter(':visible').type(wrong_password)
									cy.get('input[name="vpassword"]').filter(':visible').type(wrong_password)
									cy.get('button[class="btn-submit-change-password"]').click()
							});
			});
	});

	it('Try to login with changed password', () => {
		cy.get('li[id="signInDialogBtn"]').click({ force: true })
		.then(() => {
			cy.get('input[name="username"]').filter(':visible').type(right_username);
			cy.get('input[name="password"]').filter(':visible').type(wrong_password);	
			cy.get('button[data-translate="sign_in"]').click()
						.then(() => {
								cy.wait(5000)
								cy.get('a[data-translate="change_password"]').click({force:true})
								cy.get('input[name="cpassword"]').filter(':visible').type(wrong_password)
								cy.get('input[name="password"]').filter(':visible').type(right_password)
								cy.get('input[name="vpassword"]').filter(':visible').type(right_password)
								cy.get('button[class="btn-submit-change-password"]').click()
						});
					});
	});
	it('Check if user is able to login with correct password', () => {
		cy.get('li[id="signInDialogBtn"]').click({ force: true })
		.then(() => {
			cy.wait(5000)
			cy.get('a[data-translate="change_password"]').click({force:true})
			cy.get('input[name="username"]').filter(':visible').type(right_username);
			cy.get('input[name="password"]').filter(':visible').type(wrong_password);	
			cy.get('button[data-translate="sign_in"]').click()
		});
	});
});




