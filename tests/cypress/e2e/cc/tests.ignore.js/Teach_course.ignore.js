/**
 * @author: Savan Patel
 */
 Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

//1st part
context('SignInTeacher',() => {
	const URL = Cypress.env('CC_TEST_URL') || /*'http://localhost:5000/'*/ 'https://develop.cellcollective.org/'
	const teacherEmail = Cypress.env("CC_TEST_USERNAME") || "cchlteachertest@gmail.com"
	const teacherPassword = Cypress.env("CC_TEST_USERNAME") || "h9LtAhhZAq"
	const studentEmail = Cypress.env("CC_TEST_USERNAME") || "CCHLTestUNL@gmail.com"
	const studentPassword = Cypress.env("CC_TEST_USERNAME") || "hdMHOMCPsm"
	let course = '';
	let tempCourse = '';

	before(() => {
		cy.visit(URL)
		cy.get('a[class=button-two]') //go to teacher
		  .click({force: true})
		cy.get('.logoImg')
			.should('have.attr','src')
			.and('include','/assets/images/logo/teaching/logo.png')
		cy.get('input[name=username]')
			.type(teacherEmail, {force: true})
		cy.get('input[name=password]')	
		  .type(teacherPassword, {force: true})
		cy.get('button[type=submit]')
		  .click()	
	})

	beforeEach(() => {
		Cypress.Cookies.preserveOnce('connect.sid')
	})

	it('New logical model', () => {
		cy.contains('New Module')
			.trigger('mouseover')
		cy.contains("Logical Model")
			.trigger('mouseover')
			.then(() => {
				cy.contains('Create')
				.click()
			})
	})

	it('Creating Survey', () => {
		cy.get('input[class="icon base-add-activity-group"]').click()
		cy.get('div[class="heading appBar"] div[class="menu menuBar CONTENT"]')
			.contains('ActivityGroup1').click()

		cy.contains('Insert').trigger('mouseover')
		cy.contains('Panel').trigger('mouseover')
		cy.contains('Content').trigger('mouseover')
			.then(() => {
				cy.contains('Add Survey')
				.click()
			})
		
		cy.contains('Insert').click()	
		
		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="bar"] input[class="icon base-add"]')
			.click()

		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] div[class="survey-q-header"] input')
			.eq(4).click()

		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] div[class="survey-q-header"] div[class="editable enabled header multiline"]')
			.dblclick({force: true}).wait(100).then(() => {
				cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] div[class="survey-q-header"] input')
					.last()
					.clear({force: true})
					.type('Test Question', {force: true})
			})

		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] ul[class="editable survey"] input[class="icon base-add"]')
			.click().click().click()
		
		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] ul[class="editable survey"] div[class="option"] input')
			.eq(1).click()

		cy.get('input[class="icon base-add-activity-group"]').click()
		cy.get('div[class="heading appBar"] div[class="menu menuBar CONTENT"]')
			.contains('ActivityGroup2').click()

		cy.contains('Insert').trigger('mouseover')
		cy.contains('Panel').trigger('mouseover')
		cy.contains('Content').trigger('mouseover')
			.then(() => {
				cy.contains('Submit Button')
				.click()
			})

		cy.contains('Insert').click()	

	})

	it('share with student', () => {
		cy.contains('File').trigger('mouseover')
			.then(() => {
				cy.contains('Share')
				.click()
			})


		cy.get('div[class="arrangement"] div[class="view"]').first()
			.find('div[class="actions"] input[class="icon base-add"]').each(($input) => {
				cy.wrap($input).click()
			})
		
		cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
		  .find('div table tbody[class="selectable"] tr td[class="float"]').first().click({force: true}).wait(100).then(() => {
				cy.get('div[class="arrangement"] div[class="view"] div[class="content"]')
					.find('div table[class="selected"] tbody tr td').first().click().should('have.class', 'editing float')
					.type(studentEmail)
				})
		
		let i = 0
		cy.get('div[class="content"]')
			.find('div[class="scrollable"] table tbody')
			.find('tr').each(($createdExpr, index) => {
					if(i == 0){
						cy.wrap($createdExpr).find('span[class="checkbox"]').click({ force: true })
					}
					i++;
			})
		
		cy.contains('File').trigger('mouseover')
			.then(() => {
				cy.contains('Save')
					.click()
			})

	})

	it('create and add to course', () => {
		
		cy.get('div[class="heading appBar"] div[class="topbar"] div').find('div[class="editable enabled"] span[class="modelName"]')
			.dblclick({force: true}).wait(100).then(() => {
				cy.get('div[class="heading appBar"] div[class="topbar"] div input')
					.eq(0).clear({force: true})
					.type('Test Model 1', {force: true})
			})

		cy.contains('Workspace').trigger('mouseover')
			.then(() => {
				cy.contains('Content Design')
				.click()
			})
		cy.get('div[class="heading appBar"] div[class="menu menuBar CONTENT"]')
			.contains('Overview').click({force: true})

		cy.contains('File').trigger('mouseover')
			.then(() => {
				cy.contains('Save')
					.click()
			})
		
		// add to course inside the model
		cy.get('div[class="arrangement"] div[class="view"]').eq(5)
			.find('input').click()
		cy.get('div[class="overlay"] div[class="view"] div[class="browser-scroller"]')
			.contains('ul li', 'Test Course 1').first().click()
		cy.get('div[class="overlay"] div[class="view"] div[class="content"] input')
			.click()

		cy.get('img[class="logoImg"]').click()
		cy.wait(2000)

		cy.contains('My Courses').click()
		cy.wait(5000);
		cy.get('div[class="view"] div[class="bar"] div[class="actions"]').eq(1)
			.find('input[class="icon base-add"]').click()
		cy.wait(1000)

		cy.get('div[class="view"] div[class="browser-scroller"] div[class="view"] div[class="bar"] div[class="course-header"]')
			.find('div[class="editable enabled course-title"]')
			.first().click({force: true}).wait(100).then(() => {
				cy.get('div[class="view"] div[class="browser-scroller"] div[class="view"] div[class="bar"] div[class="course-header"] input')
					.eq(0).clear({force: true})
					.type('Test Course 1', {force: true})
			})

		cy.get('div[class="view"] div[class="browser-scroller"] div[class="view"] div[class="bar"] div[class="actions"]')
			.first()
			.get('span[class="courseCodeText"]').first().then(($code) => {
				course = $code.text().replace(/-/g, "");
			})

		cy.wait(5000)
		//add to course from my courses
		// cy.get('div[class="view"] div[class="browser-scroller"] div[class="view"] div[class="slick-list"] div[class="courseCard addModuleToCourse card"] div[class="addModelDropdownIcon"] svg')
		// 	.first().click({force: true}).wait(1000).then(() => {
		// 		cy.get('div[class="view"] div[class="browser-scroller"] div[class="view"] div[class="slick-list"] div[class="courseCard addModuleToCourse card"] div[class="browser-scroller addModelList"] ul li div')
		// 			.eq(1).click({force: true}).wait(1000).then(() => {
		// 				cy.get('div[class="view"] div[class="browser-scroller"] div[class="view"] div[class="slick-list"] div[class="courseCard addModuleToCourse card"] div[class="browser-scroller addModelList"] ul li div[title="Test Model 1"]')
		// 					.first()
		// 					.click()
		// 				cy.get('div[class="view"] div[class="browser-scroller"] div[class="view"] div[class="slick-list"] div[class="courseCard addModuleToCourse card"] div[class="browser-scroller addModelList"] ul li[class="add-model-btn"]')
		// 					.click()
		// 			})
		// 	})
		
	})

	it('Sign in student', () => {
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
			.then(() => {
				cy.contains('Student Access')
					.click()
			})
		cy.wait(5000)

		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
			.then(() => {
				cy.contains('Sign In')
					.click()
			})
		
		cy.wait(3000)

		cy.get('input[name=username]')
			.type(studentEmail, {force: true})
		cy.get('input[name=password]')	
		  .type(studentPassword, {force: true})
		cy.get('button[type=submit]')
		  .click()
		cy.wait(1000)
	})

	it('Enroll in Course', () => {
		cy.contains('My Courses').click()
		cy.wait(5000);

		cy.get('div[class="view"] div[class="content"] div[class="view"] div[class="bar"] div[class="cgi-group"] input')
			.first()
			.click({force: true}).wait(100).type(course)

		// cy.get('div[class="view"] div[class="content"] div[class="view"] div[class="bar"] div[class="cgi-group"] input')
		// 	.first()
		// 	.click({force: true}).wait(100).type("QY4GRA3XM")
		
		cy.get('div[class="view"] div[class="content"] div[class="view"] div[class="bar"] button[class="btnEnroll"]')
			.click()
		cy.wait(100)
	})

	it('Complete Survey', () => {
		cy.get('div[class="view"] div[class="browser-scroller"] div[class="view"] div[class="slick-list"] div[class="frame"]')
			.first().click()
		cy.wait(5000)
		
		cy.get('div[class="arrangement"] div[class="view"]').eq(5)
			.find('input').click()
		cy.wait(5000)
		
		cy.get('div[class="heading appBar"] div[class="menu menuBar CONTENT"]')
			.contains('ActivityGroup1').click()
		
		cy.get('div[class="app"] div[class="arrangement"] div[class="view"] div[class="content"] ul[class="editable"] div[class="option"] input')
			.eq(1).click()

		cy.get('div[class="heading appBar"] div[class="menu menuBar CONTENT"]')
			.contains('ActivityGroup2').click()
		cy.wait(5000)

		cy.get('div[class="arrangement"] div[class="view"] input')
			.click()

		cy.get('div[class="overlay"] div[class="view"] input')
			.eq(2).click()

		cy.get('div[class="overlay"] div[class="view"] input')
			.first().click()
	})

	it('Sign In teacher', () => {
		cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
			.then(() => {
				cy.contains('Instructor Access')
					.click()
			})
		cy.wait(5000)

		cy.get('input[name=username]')
			.type(teacherEmail, {force: true})
		cy.get('input[name=password]')	
		  .type(teacherPassword, {force: true})
		cy.get('button[type=submit]')
		  .click()
		cy.wait(1000)
	})

	it('Generate Report', () => {
		cy.contains('My Courses').click()
		cy.wait(5000);

		cy.get('div[class="view"] div[class="browser-scroller"] div[class="view"] div[class="bar"] div[class="course-header"] div[class="editable enabled course-title"]')
			.first().should('have.text', 'Test Course 1')

		cy.get('div[class="view"] div[class="browser-scroller"] div[class="view"] div[class="slick-list"]')
			.first().get('div[class="courseCard card"] div[class="learning"]')
			.first().click()
		
		cy.wait(1000)
		cy.contains('Workspace').trigger('mouseover')
			.then(() => {
				cy.contains('Learning Insights')
				.click()
			})
	})

})