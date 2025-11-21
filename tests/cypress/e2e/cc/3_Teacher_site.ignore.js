
/**
 * @author: Zdenek Vafek
 * Testing the Teacher site
 */
 Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})


context('SignUpTeacher',() => {

	const URL = Cypress.env('CC_TEACH_TEST_URL') || 'http://localhost:5000/' 
	const teacher_email = Cypress.env("CC_TEST_USERNAME") || "cchlteachertest@gmail.com"
	const teacher_password = Cypress.env("CC_TEST_USERNAME") || "Teacher_tests1"

	before(() => {
		cy.visit(URL)
		// , 		
		// 	{auth: {
		// 		username: teacher_email,
		// 		password: teacher_password,
		// 		},
		// 	})
		cy.get('a[class=button-two]') //go to research
			.click({force: true})	
		cy.wait(10000)	
	})


	beforeEach(() => {
		//cy.restoreLocalStorage();
		Cypress.Cookies.preserveOnce('connect.sid')
		//Cypress.Cookies.preserveOnce('session_id', 'remember_token');
	})

	it('Teacher login', () => {
		// cy.get('button')
		// 	.contains("Sign in")
		// 	.click()
		cy.get('input[name="username"]')
			.clear()
			.type(teacher_email)
		cy.get('input[type="password"]')
			.clear()
			.type(teacher_password)
		cy.get('button[type="submit"]')		
			.click()
		cy.get('button')
			.contains("Sign in")
		 	.click()
		cy.get('input[class="icon base-close"]')
			.click()		
	})


	it('Teacher site - check landing page elements', () => {
		cy.contains("Teacher Test")
			.should('be.visible')
		cy.contains("Public Modules")
			.should('be.visible')
		cy.contains("My Modules")
			.should('be.visible')	
		cy.contains("Shared with Me")
			.should('be.visible')	
		cy.contains("My Courses")
			.should('be.visible')	
		cy.contains("New Module")
			.should('be.visible')
		cy.contains("Upgrade")
			.should('be.visible')
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
			.then(() => { 
				cy.contains("Your Profile").should('be.visible')
				cy.contains("Change Password").should('be.visible')		
				cy.contains("Sign Out").should('be.visible')	
				cy.contains("Research Platform").should('be.visible')	
				cy.contains("Instructor Access").should('be.visible')	
				cy.contains("Student Access").should('be.visible')	
				cy.contains("Language").should('be.visible')	
				cy.contains("Manage subscription").should('be.visible')	
		})						
	})

	it('Teacher site - teacher profile', () => {
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
		.then(() => { 
			cy.contains("Your Profile").click()
			cy.get('input[name="email"]')
				.should('have.value',"cchlteachertest@gmail.com")
			cy.get('input[name="firstName"]')
				.should('have.value',"Teacher")	
			cy.get('input[name="lastName"]')
				.should('have.value',"Test")	
			cy.get('input[name="institution"]')
				.should('have.value',"Adler University")	
			cy.get('input[class="icon base-close"]')	
				.click()
		})
	})

	it('Teacher site - New Module elements', () => {
		cy.contains('New Module')
			.trigger('mouseover')
		cy.contains("Logical Model")
			.trigger('mouseover')
		cy.contains('Create')
			.click({force: true})
		.then(() => {
			cy.wait(10000)
			// cy.contains("Overview")
			// 	.should('be.visible')
			// 	cy.contains("Supporting Materials")
			// 	.should('be.visible')
			// 	cy.contains("References")
			// 	.should('be.visible')
			// 	cy.contains("Properties")
			// 	.should('be.visible')	
		})
	})	


		it.skip('Create module', () => {
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
	
		it.skip('Add new activity group', () => {
			cy.get('input[class="icon base-add-activity-group"]').click()
				.then(() => {
					cy.contains("ActivityGroup1").click()
					cy.contains("Activity1").should('be.visible')
				})
		})
	
		it.skip('Add new survey panel', () => {
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
			cy.get('input[class="icon base-add"]').click()
			cy.get('input[title="Multiple choice"]').click()
			cy.get('input[class="icon base-add"]').click({multiple: true})
			cy.get('input[class="icon base-add"]').click({multiple: true})	
			cy.get('input[class="icon base-add"]').click({multiple: true})	
			cy.get('input[type="checkbox"]').first().click()
		})
	
		it.skip('Save module and add to course', () => {
			cy.contains("File").trigger('mouseover')
				.then(() => {
						cy.contains("Save").click()
				})
			cy.wait(5000)
			cy.contains("File").trigger('mouseover').then(() => {cy.contains("Share").click()})
			cy.get('input[class="icon base-add"]').click({multiple: true})
			cy.get('td[class="editable float"]').first().click().type("CCHLTestUNL@gmail.com")
			cy.contains("File").trigger('mouseover')
			.then(() => {
					cy.contains("Save").click()
			})
// 	// ADD ACTIVITY GROUP
// 		cy.get('input[class="icon base-add-activity-group"]')	
// 		  .click()
// 		cy.contains("ActivityGroup1")
// 		  .click()

// 	//Rename module	
// 		cy.get('.modelName')
// 			 .should('be.visible')
// 			 .click()
// 		cy.get('form[class="editable menu"]')	
// 			 .clear()
// 			 .type('TEST_MODULE')
// 			 .type('{enter}')	
// 		cy.contains("File").trigger('mouseover')
// 		 	.then(() => {
// 				cy.contains("Save")
// 					.click()
// 				})	 


// //File elements
// 		cy.contains("File").trigger('mouseover')
// 			.then(() => {
// 				cy.contains("New Model").should('be.visible')
// 				cy.contains("Save").should('be.visible')
// 				cy.contains("Save Layout").should('be.visible')
// 				cy.contains("Share").should('be.visible')
// 				cy.contains("Copy").should('be.visible')
// 				cy.contains("Download").should('be.visible')
// 			})
// 			.trigger('mousedown')		

// //Insert elements	 
// 		cy.contains("Insert").trigger('mouseover')
// 		.then(() => {
// 			cy.contains("Panel").trigger('mouseover')	
// 				.then(() => {
// 					cy.contains(/^Model/).trigger('mouseover')
// 						.then(() => {
// 							cy.contains("Internal Components").should('be.visible')
// 							cy.contains("External Components").should('be.visible')
// 							cy.contains("Regulatory Mechanism").should('be.visible')
// 							cy.contains("Regulatory Mechanism Compressed").should('be.visible')
// 							cy.contains("Regulation Expression").should('be.visible')
// 							cy.contains("Interaction Properties").should('be.visible')
// 							cy.contains("Graph").should('be.visible')
// 							cy.contains("Component Graph").should('be.visible')
// 							cy.contains("Dominance Graph").should('be.visible')
// 							cy.contains("Model Versions Graph").should('be.visible')
// 						})
// 						.trigger('mousedown')
// 				})
// 				.trigger('mousedown')
// 		})
// 		.trigger('mousedown')
		
// 		cy.contains("Insert").trigger('mouseover')
// 		.then(() => {
// 			cy.contains("Panel").trigger('mouseover')	
// 				.then(() => {
// 					cy.contains("Simulation").trigger('mouseover')
// 						.then(() => {
// 							cy.contains("Simulation Control").should('be.visible')
// 							cy.contains("Internal Components").should('be.visible')
// 							cy.contains("External Components").should('be.visible')
// 							cy.contains("Simulation Graph").should('be.visible')
// 							cy.contains("Activity Network").should('be.visible')
// 							cy.contains("Activity Network Variance").should('be.visible')
// 							cy.contains("Activity Network Clustered").should('be.visible')
// 						})
// 						.trigger('mousedown')
// 					})
// 					.trigger('mousedown')
// 		})
// 		.trigger('mousedown')
// 		cy.contains("Insert").trigger('mouseover')
// 		.then(() => {
// 			cy.contains("Panel").trigger('mouseover')	
// 				.then(() => {	
// 					cy.contains("Analysis").trigger('mouseover')
// 						.then(() => {
// 							cy.contains("Experiments").should('be.visible')
// 							cy.contains("Experiment Settings").should('be.visible')
// 							cy.contains("External Components").should('be.visible')
// 							cy.contains("Internal Components").should('be.visible')
// 							cy.contains("Graph Components").should('be.visible')
// 							cy.contains("Activity Relationships Graph").should('be.visible')
// 							cy.contains("Component Sensitivity").should('be.visible')
// 							cy.contains("Environment Sensitivity").should('be.visible')
// 						})
// 						.trigger('mousedown')
// 				})
// 				.trigger('mousedown')
// 		})
// 		.trigger('mousedown')
// 		cy.contains("Insert").trigger('mouseover')
// 		.then(() => {
// 			cy.contains("Panel").trigger('mouseover')	
// 				.then(() => {
// 					cy.contains("Sensitivity").trigger('mouseover')
// 						.then(() => {
// 							cy.contains("Experiments").should('be.visible')
// 							cy.contains("Experiment Settings").should('be.visible')
// 							cy.contains("External Components").should('be.visible')
// 							cy.contains("Internal Components").should('be.visible')
// 						})
// 						.trigger('mousedown')
// 				})
// 				.trigger('mousedown')
// 		})
// 		.trigger('mousedown')
// 		cy.contains("Insert").trigger('mouseover')
// 		.then(() => {
// 			cy.contains("Panel").trigger('mouseover')	
// 				.then(() => {
// 					cy.contains("Knowledge Base").trigger('mouseover')
// 						.then(() => {
// 							cy.contains("Components").should('be.visible')
// 							cy.contains("Knowledge Base").should('be.visible')
// 							cy.contains("Reference Graph").should('be.visible')
// 						})
// 						.trigger('mousedown')
// 				})
// 				.trigger('mousedown')
// 		})
// 		.trigger('mousedown')
// 		cy.contains("Insert").trigger('mouseover')
// 		.then(() => {
// 			cy.contains("Panel").trigger('mouseover')	
// 				.then(() => {				
// 					cy.contains("Sharing").trigger('mouseover')
// 						.then(() => {
// 							cy.contains("Share with Collaborators").should('be.visible')
// 							cy.contains("Shareable Links").should('be.visible')
// 							cy.contains("Publish your Model").should('be.visible')
// 							cy.contains("Experiments Publishing").should('be.visible')
// 						})
// 						.trigger('mousedown')
// 					})
// 					.trigger('mousedown')
// 		})
// 		.trigger('mousedown')
// 		cy.contains("Insert").trigger('mouseover')
// 		.then(() => {
// 			cy.contains("Panel").trigger('mouseover')	
// 				.then(() => {
// 					cy.contains("Topology").trigger('mouseover')
// 						.then(() => {
// 							cy.contains("Closeness Centrality").should('be.visible')
// 							cy.contains("Connectivity Distribution").should('be.visible')
// 							cy.contains("Topology").should('be.visible')
// 							cy.contains("In-Degree Frequency").should('be.visible')
// 							cy.contains("Out-Degree Frequency").should('be.visible')
// 						})
// 						.trigger('mousedown')
// 				})
// 				.trigger('mousedown')
// 		})
// 		.trigger('mousedown')
// 		cy.contains("Insert").trigger('mouseover')
// 		.then(() => {
// 			cy.contains("Panel").trigger('mouseover')	
// 				.then(() => {
// 					cy.contains("Feedback Loops").trigger('mouseover')
// 					.then(() => {
// 							cy.contains("Feedback Loops List").should('be.visible')
// 							cy.contains("Feedback Graph View").should('be.visible')
// 					})
// 					.trigger('mousedown')
// 				})
// 				.trigger('mousedown')
// 		})
// 		.trigger('mousedown')
// 		cy.contains("Insert").trigger('mouseover')
// 		.then(() => {
// 			cy.contains("Panel").trigger('mouseover')	
// 				.then(() => {
// 					cy.contains("State Space Analysis").trigger('mouseover')
// 					.then(() => {
// 							cy.contains("State Transition Graph").should('be.visible')
// 							cy.contains("Steady State").should('be.visible')
// 							cy.contains("Internal Components").should('be.visible')
// 					})
// 					.trigger('mousedown')
// 				})
// 				.trigger('mousedown')
// 		})
// 		.trigger('mousedown')
// 		cy.contains("Insert").trigger('mouseover')
// 		.then(() => {
// 			cy.contains("Panel").trigger('mouseover')	
// 				.then(() => {
// 					cy.contains("Description").trigger('mouseover')
// 					.then(() => {
// 						cy.contains("Description").should('be.visible')
// 						cy.contains("References").should('be.visible')
// 						cy.contains("Documents").should('be.visible')
// 					})
// 					.trigger('mousedown')
// 				})
// 				.trigger('mousedown')
// 		})
// 		.trigger('mousedown')
// 		cy.contains("Insert").trigger('mouseover')
// 		.then(() => {
// 			cy.contains("Panel").trigger('mouseover')	
// 				.then(() => {
// 					cy.contains("Learning").trigger('mouseover')
// 					.then(() => {
// 						cy.contains("Overview").should('be.visible')
// 						cy.contains("Supporting Materials").should('be.visible')
// 						cy.contains("Image").should('be.visible')
// 						cy.contains("Learning Objectives").should('be.visible')
// 						cy.contains("References").should('be.visible')
// 						cy.contains("Start").should('be.visible')
// 					})
// 					.trigger('mousedown')
// 				})
// 				.trigger('mousedown')
// 		})
// 		.trigger('mousedown')
// 		cy.contains("Insert").trigger('mouseover')
// 		.then(() => {
// 			cy.contains("Panel").trigger('mouseover')	
// 				.then(() => {
// 					cy.contains("Content").trigger('mouseover')
// 					.then(() => {
// 						cy.contains("Add Survey").should('be.visible')
// 						cy.contains("Add Editor").should('be.visible')
// 						cy.contains("Add Image").should('be.visible')
// 						cy.contains("Submit Button").should('be.visible')
// 					})
// 					.trigger('mousedown')
// 				})
// 				.trigger('mousedown')
// 		})
// 		.trigger('mousedown')
		
// // //Edit elements
// // 		cy.contains("Edit").trigger('mouseover')
// // 		.then(() => {
// // 			cy.get('li[class="disabled"]')//contains('span',"Undo")//.should('be.disabled')
// // 			cy.contains("Redo").should('be.disabled')
// // 			cy.contains("Restore Layout").should('be.visible').trigger('mouseover')
// // 				.then(() => {
// // 					cy.contains("From Defaults").should('be.visible')
// // 					cy.contains("From Model").should('be.visible')
// // 				})
// // 		})

// //Workspace elements
// 		cy.contains("Workspace").trigger('mouseover')
// 		.then(() => {
// 			cy.contains("Model").should('be.visible')
// 			cy.contains("Content Design").should('be.visible')
// 		})

// //Reports elements
// 		cy.contains("Reports").trigger('mouseover')
// 		.then(() => {
// 			cy.contains("Generate Student Report").should('be.visible')
// 			cy.contains("Image Report").should('be.visible')
// 		})

// //Help elements	
// 		// cy.contains("Reports").trigger('mouseover')
// 		// .then(() => {
// 		// 	cy.contains("Tutorials").should('be.visible')
// 		// 	cy.contains("Documentation").should('be.visible')
// 		// 	cy.contains("About").should('be.visible')
// 		// 	cy.contains("Reload").should('be.visible')
// 		// 	cy.contains("Debug").should('be.visible')
// 		// })
	})

	it.skip('Teacher site - edit Overview', () => {
		cy.contains('span',"Overview").click({force:true})
		cy.get('dl[class=area]').click().type("Test of overview")
		cy.get('input[class="icon base-menu"]').click()
		cy.contains("High school").should('be.visible')
		cy.contains("Freshmen (UG)").should('be.visible')
		cy.contains("Sophomore (UG)").should('be.visible')
		cy.contains("Junior (UG)").should('be.visible')
		cy.contains("Senior (UG)").should('be.visible')
		cy.contains("Graduate").should('be.visible').click()
			.then(() => {
				cy.contains("Graduate").should('be.visible')
			})
		cy.contains(/^1/).click()
		cy.get('form[class="editable menu bold"]')
			.type("5")	
	})

})	
