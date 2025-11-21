
/**
 * @author: Zdenek Vafek
 * Testing the Sign Up feature
 */
Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})


context('SignUpResearcher',() => {

  const URL = Cypress.env('CC_TEST_URL') || 'https://staging.cellcollective.org/'//'http://localhost:5000/' 
  const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
  const email1 = Cypress.env("CC_TEST_USERNAME") || "testSharing@email.com"
  const firstName = Cypress.env("CC_TEST_USERNAME") || "Test"
  const lastName = Cypress.env("CC_TEST_USERNAME") || "Test"
  const password = Cypress.env("CC_TEST_USERNAME") || "hdMHOMCPsm"
  const institution = Cypress.env("CC_TEST_INSTITUTION") || "University of Nebraska-Lincoln"

before(() => {
  cy.wait(3000)
  cy.visit(URL)
  cy.get('a[class=button-three]') //go to research
  .click({force: true})
})

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid')
  })

	it('Open and fill Sign Up form', () => {
    cy.wait(500)
    cy.intercept('POST', '**/_api/login').as('login')
    cy.intercept('GET', '/api/users/me/profile', {
      statusCode: 200,
      body: {
        data: {
          activeAuthorityRequests: []
        }
      },
    })
    cy.wait(500)
/////Sign Up without password		
    cy.get('div[class="icon large-account topRightMenu"]').trigger('mouseover').click()
      .then(() => {
        cy.contains("Sign Up").click({force: true});
        cy.get('input[name=email]').type(email, {force: true});
        cy.get('input[name=firstName]').type(firstName, {force: true});
        cy.get('input[name=lastName]').type(lastName, {force: true});
        cy.get('input[name=institution').filter(':visible')
          .type(institution)
        cy.get('input[class="checkbox"]')
          .click()
        cy.get('button[class="btn-signup"]').eq(0).filter(':visible').click()
      });
      

////Sign Up + Select institution
			cy.get('div[class="icon large-account topRightMenu"]').trigger('mouseover').click()
      .then(() => {
        cy.contains("Sign Up").click({force: true});
        cy.get('input[name=email]').type(email, {force: true});
        cy.get('input[name=firstName]').type(firstName, {force: true});
        cy.get('input[name=lastName]').type(lastName, {force: true});
        cy.get('input[name=password]').filter(':visible')
          .type(password)
        cy.get('input[name=vpassword]').filter(':visible')
          .type(password)
        cy.get('input[name=institution').filter(':visible')
          .type(institution)
        cy.get('input[class="checkbox"]')
          .click()
        cy.get('button[class="btn-signup"]').eq(0).filter(':visible').click()
      });
			cy.containes("Test Test").should('be.visible')	
			cy.contains("Sign Out").click({force: true})


//////Sign Up - existing user			

			cy.get('div[class="icon large-account topRightMenu"]').trigger('mouseover').click()
			.then(() => {
				cy.contains("Sign Up").click({force: true});
				cy.get('input[name=email]').type(email, {force: true});
				cy.get('input[name=firstName]').type(firstName, {force: true});
				cy.get('input[name=lastName]').type(lastName, {force: true});
				cy.get('input[name=password]').filter(':visible')
					.type(password)
				cy.get('input[name=vpassword]').filter(':visible')
					.type(password)
				cy.get('input[name=institution').filter(':visible')
					.type(institution)
				cy.get('input[class="checkbox"]')
					.click()
				cy.get('button[class="btn-signup"]').eq(0).filter(':visible').click()//{force: true});
			});	
  })

  it('Try If new user login working', () => {
		cy.get('li[id="signInDialogBtn"]').click({force:true})
		.then(() => {
			cy.get('input[name="username"]').filter(':visible').type(email);
			cy.get('input[name="password"]').filter(':visible').type(password);
			cy.get('button[class="btn-signin"]').click();
			cy.wait(5000);
		});
  })
  

//// Sign Up second user with custom institution	
  it.skip('Sign up user for sharing', () => {
		cy.get('div[class="icon large-account topRightMenu"]').trigger('mouseover').click()
		.then(() => {
			cy.contains("Sign Up").click({force: true});
			cy.get('input[name=email]').type(email1, {force: true});
			cy.get('input[name=firstName]').type(firstName, {force: true});
			cy.get('input[name=lastName]').type(lastName, {force: true});
			cy.get('input[name=password]').filter(':visible')
				.type(password)
			cy.get('input[name=vpassword]').filter(':visible')
				.type(password)
			//custom institution is missing on new dashboard	
			cy.get('input[name=institution').filter(':visible')
				.type(institution)
			cy.get('input[class="checkbox"]')
				.click()
			cy.get('button[class="btn-signup"]').eq(0).filter(':visible').click()
		});
		cy.containes("Test Test").should('be.visible')	
  })
})


