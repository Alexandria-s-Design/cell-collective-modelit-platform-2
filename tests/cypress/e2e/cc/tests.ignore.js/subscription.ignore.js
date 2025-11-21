

/**
 * @author: Harshada Bhangale
 * Testing the Subscription payment feature
 */
 Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})
describe('Subscription Payment UI test', () => {
  const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' 
  const username = Cypress.env("CC_TEST_USERNAME") || "cchlteachertest@gmail.com"
  const password = Cypress.env("CC_TEST_PASSWORD") || "Teacher_tests1"
  
  before(() => {
    cy.visit(URL)
    cy.get('a[class=button-three]') //go to research
      .click({force: true})  
      cy.wait(5000)
      
    })

    it('Teach subscription using stripe', () => {

			cy.get(".topRightMenu")
			.trigger('mouseover')
			.contains("Instructor Access")
			.click()
			.wait(10000)				

			cy.contains('Sign In')
			.click({force: true})
			.then(() => {
				cy.get('input[name=username]')
					.type(username, {force: true})
				cy.get('input[name=password]')
					.type(password, {force: true})
				cy.get('button[type="submit"]')
					.click()
					.then(() => {
						cy.wait(5000)
						cy.contains('Upgrade')
						 .click({force: true})
						 cy.contains('$59/Year')
						 .click({force: true})

						 cy.get(".checkout.action-btn")
						 .click({force:true})
						 .then(() => {
								cy.wait(5000)
								cy.get('iframe').then($iframe => {
											const doc = $iframe.contents()
											let input = doc.find('input')[0]
											// super weird stuff here, if you just input '4242424242424242', the value
											// that you end up seeing in the input element is jumbled up a little,
											// probably because of the way how Stripe inserts spaces while you are
											// typing. By luck I found out that this issue can get worked around if
											// you just chain-call type()

											cy
												.wrap(input)
												.type('hhh@gmail.com')
												input = doc.find('input')[1]
											cy
												.wrap(input)
												.type('4242')
												.type('4242')
												.type('4242')
												.type('4242')
											input = doc.find('input')[2]
											cy
												.wrap(input)
												.clear()
												.type('12')
												.type('25')
											input = doc.find('input')[3]
											cy
												.wrap(input)
												.type('123')
												.type('{enter}')
										})

							})
					})
					
		})

  })
    
})
