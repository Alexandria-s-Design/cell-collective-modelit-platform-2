// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
// Admin email: hello.helikarlab@gmail.com
//       password: foobar@123



Cypress.Commands.add('login', (email, password) => {
	cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
	.then(() => {cy.contains("Sign In").click()
		.then(() => {
	cy.get('input[name=username]')
		.type(email, {force: true})
	cy.get('input[name=password]')
		.type(password, {force: true})
	cy.get('button[type=submit]')
		.click()
	cy.get('.right')
		.should('be.visible')
		})
	})
	cy.wait(500)
});

Cypress.Commands.add('signout', () => {
	cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
		.then(() => {cy.contains("Sign Out").click()
	cy.wait(500)
});

Cypress.Commands.add('signin', (email, password) => {
	
	cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
	.then(() => {cy.contains("Sign In").click()
		.then(() => {
			cy.get('input[name=username]')
				.type(email, { force: true })
			cy.get('input[name=password]')
				.type(password, { force: true })

			cy.get('body')
				.then(($body) => {
					if ($body.find('button[type=submit]').length) {
						cy.get('button[type=submit]')
							.click();
					} else {
						cy.get('input[type=submit]')
						.click()
					}
				})
			})
			})
			cy.get('.right')
				.should('be.visible')
		})
	cy.wait(500)
});

Cypress.Commands.add('clearAllLocalStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
  })
})

Cypress.Commands.add('clearAllSessionStorage', () => {
  cy.window().then((win) => {
    win.sessionStorage.clear()
  })
})
																										
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('dragAndDrop', (subjectSelector, targetSelector) => {
  cy.get(subjectSelector)
      .realMouseDown({ button: 'left', position: 'center' })
      .realMouseMove(0, 10, { position: 'center' });
  cy.get(targetSelector).realMouseMove(0, 0, { position: 'center' }).realMouseUp();
});

Cypress.Commands.add('clearAllLocalStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear()
  })
})

Cypress.Commands.add('clearAllSessionStorage', () => {
  cy.window().then((win) => {
    win.sessionStorage.clear()
  })
})