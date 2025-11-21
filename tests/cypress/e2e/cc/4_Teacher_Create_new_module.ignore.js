
/**
 * @author: Zdenek Vafek
 * Testing the Teacher site
 */
Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

context('Create_new_module_for_student',() => {

	const URL = Cypress.env('CC_TEST_URL') ||  'http://localhost:5000/' //develop.
	const teacher_email = Cypress.env("CC_TEST_USERNAME") || "cchlteachertest@gmail.com"
	const teacher_password = Cypress.env("CC_TEST_USERNAME") || "h9LtAhhZAq" //"Teacher_tests1"
	const email = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
	const password = Cypress.env("CC_TEST_USERNAME") || "hdMHOMCPsm"

	before(() => {
		cy.visit(URL)
		cy.clearCookies()
		cy.clearLocalStorage()

		cy.get('a[class=button-three]')
		  .click({force: true})
		cy.get('.logoImg')
			.should('have.attr','src')
			.and('include','/assets/images/logo/research/logo.png')
	
		cy.get('.icon.large-account.topRightMenu').then($el => {
				$el[0].dispatchEvent(new Event('mouseenter', { bubbles: true }));
		});

		cy.get('.menu').eq(0).then($menu => {
				if ($menu.is(':hidden')) {
						cy.log('Menu is hidden');
						cy.get('.menu').invoke('attr', 'style', 'display: block !important');
						cy.wait(500);
						cy.contains("Instructor Access").should('be.visible').click();
				} else {
						cy.log('Menu is visible');
						cy.contains("Instructor Access").should('be.visible').click();
				}
		});
		
		cy.wait(15000);
		cy.get('button[class="btn btn-primary"]').eq(0).should('be.visible').click({force:true});

			cy.get('input[name="username"]')
				.clear()
				.type(teacher_email)
			cy.get('input[type="password"]')
				.clear()
				.type(teacher_password)
			cy.get('button[type="submit"]')		
				.click()
			cy.wait(5000)
			
			cy.window().then(win => {
				win.localStorage.setItem('access_token', win.localStorage.getItem('access_token'));
				win.localStorage.setItem('refresh_token', win.localStorage.getItem('refresh_token'));
			});
	})


	Cypress.Commands.add('addAuthHeader', () => {
		cy.intercept('POST', '/api/*', (req) => {
				const token = localStorage.getItem('auth_token');
				if (token) {
						req.headers['Authorization'] = `Bearer ${token}`;
				}
		}).as('apiRequest');
});

	beforeEach(() => {
		Cypress.Cookies.preserveOnce('connect.sid')
		cy.window().then(win => {
			const token = win.localStorage.getItem('access_token');
			if (token) {
					win.localStorage.setItem('access_token', token);
			} else {
					cy.log('Token is missing, login again');
					cy.request('POST', 'web/api/auth/login', {
							email: teacher_email,
							password: teacher_password
					}).then(response => {
							expect(response.status).to.eq(200);
							localStorage.setItem('access_token', response.body.data.access_token);
					});
			}
	});
	})

	it('Create new Course', () => {
		cy.contains('My Courses').click();
		cy.get('input[title="Add a course"]').click();
		cy.wait(5000)
		cy.contains("Untitled Course").eq(0).click();
		cy.get('.course-title input').clear().type('TESTMODULE1{enter}');
		cy.get('.courseCodeText').invoke('text').as('courseKey'); // Uložení aliasu

	});
	
	it('Create module', () => {
		cy.wait(10000)
		cy.contains('New Module')
			.trigger('mouseover')
		cy.contains("Logical Model")
			.trigger('mouseover')
		cy.contains('Create')
			.click()
		cy.contains("New Model")
			.should('be.visible')
	})

	it('Add new activity group', () => {
		cy.get('input[class="icon base-add-activity-group"]').click()
			.then(() => {
				cy.contains("ActivityGroup1").click()
				cy.contains("Activity1").should('be.visible')
			})
	})

	it('Add new survey panel', () => {
		cy.contains("Insert").trigger('mouseover')
			.then(() => {
				cy.contains("Panel").trigger('mouseover')	
					.then(() => {
						cy.contains("Content").trigger('mouseover')
							.then(() => {
								cy.contains("Add Text Editor").click()
							})
					})
			})
		cy.get('input[class="icon base-add"]').eq(0).click()
		cy.get('li.li-text').eq(0) 
		.find('div[contenteditable="true"]')
		.click()
		.type('Test', { delay: 100 }); 

		cy.get('input[class="icon base-add"]').eq(1).click()
		cy.get('input[title="Multiple choice"]').click()
		// cy.get('input[class="icon base-add"]').click({multiple: true})
		// cy.get('input[class="icon base-add"]').click({multiple: true})	
		// cy.get('input[class="icon base-add"]').click({multiple: true})
		cy.get('li.li-question').eq(0)
  		.within(() => {
    	cy.get('input.icon.base-add').click();
			cy.get('input.icon.base-add').click();
			cy.get('input.icon.base-add').click();
  	});	
		cy.get('input[type="checkbox"]').first().click()
		//cy.get('.option input[type="radio"]').eq(0).check();
	})

	it('Add new sub Activity with Sybmit button', () => {
		cy.get('input[class="icon base-add-activity"]').click()
		cy.contains("Activity2").click()

		cy.contains("Insert").trigger('mouseover')
		.then(() => {
			cy.contains("Panel").trigger('mouseover')	
				.then(() => {
					cy.contains("Content").trigger('mouseover')
						.then(() => {
							cy.contains("Submit Button").click();
						})
				})
		})
	});


	it('Save module', () => {
		cy.contains("File").trigger('mouseover')
			.then(() => {
					cy.addAuthHeader();
					cy.contains("Save").click()
  		})
		cy.wait(5000)
		cy.contains("File").click();
		cy.contains("Insert").click();
		cy.contains("File").trigger('mouseover').then(() => {cy.contains("Share").click()})
		cy.get('input[class="icon base-add"]').click({multiple: true})
		cy.get('td[class="editable float"]').first().click().type("CCHLTestUNL@gmail.com")
		cy.contains("File").trigger('mouseover')
		.then(() => {
			cy.addAuthHeader();
			cy.contains("Save").click()
		})
	})

	it('Add module to course', () => {

	});

	it('Student login', () => {
		cy.wait(10000)
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
			.then(() => {cy.contains("Student Access").click()});
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
			.then(() => {cy.contains("Sign In").click()
			cy.get('input[name="username"]')
				.clear()
				.type(email)
			cy.get('input[type="password"]')
				.clear()
				.type(password)
			cy.get('button[type="submit"]')		
				.click()
		})
		cy.wait(5000)	
	})
	
	it('Go to my Learning', () => {
		cy.contains("My Learning").click()
		cy.wait(15000)
	})

	it('Submit module', () => { 
		cy.contains("My Courses").click()
		//should use 
		// cy.get('@courseKey').then((courseKey) => {
		// 	cy.log('Použitý Course Key:', courseKey);
		// });
		
		cy.get('input[name="field-0"]').click().type("R")
		cy.get('input[name="field-1"]').click().type("7")
		cy.get('input[name="field-2"]').click().type("V")
		cy.get('input[name="field-3"]').click().type("5")
		cy.get('input[name="field-4"]').click().type("7")
		cy.get('input[name="field-5"]').click().type("P")
		cy.get('input[name="field-6"]').click().type("3")
		cy.get('input[name="field-7"]').click().type("L")
		cy.get('input[name="field-8"]').click().type("W")
		cy.get('button[class="btnEnroll"]').click()
		cy.get('img[class="model-img"]').first().click()
		cy.wait(5000)
		cy.get('input[class="raised no-transform expand standalone learning"]').click()
		cy.contains("Lesson 1").click()
		cy.get('.public-DraftEditor-content').eq(1).click().clear().type('Test{enter}');

		cy.get('input[type="radio"]').first().click({force: true})
		cy.get('input[value="Submit Lesson"]').click({force: true})
		cy.contains("OK").click();
		cy.contains("OK").click(); //remove
	})

	it("Back to teacher", () => {
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
			.then(() => {cy.contains("Instructor Access").click()});

			cy.get('button[class="btn btn-primary"]').eq(0).should('be.visible').click()

			cy.get('input[name="username"]')
				.clear()
				.type(teacher_email)
			cy.get('input[type="password"]')
				.clear()
				.type(teacher_password)
			cy.get('button[type="submit"]')		
				.click()
			cy.wait(5000)
	});

	it('My Courses', () => {
		cy.contains("My Courses").click()
		cy.get('div[class="courseCard card"]').first().click()
		cy.contains("Workspace").trigger('mouseover');
		cy.contains("Learning Insights").click();
	});

})
