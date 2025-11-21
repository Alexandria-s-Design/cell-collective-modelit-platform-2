Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})


Cypress.config("viewportWidth", 1566); // to enable drag and drop for regulators panel

const URL = Cypress.env('CC_TEST_URL') || 'http://localhost:5000/' 
const email = Cypress.env("CC_TEST_EMAIL") || "CCHLTestUNL@gmail.com"
const password = Cypress.env("CC_TEST_PASSWORD") || "hdMHOMCPsm"
const numOfMetabolites = 3
const numOfGens = 3
const numOfReactions = 1
const numOfExperiments = 1


context('GIMME',() => {


	before(() => {
		cy.visit(URL)
		cy.get('a[class=button-three]') //go to research
			.click({force: true})
		cy.wait(5000)	
		// cy.contains('Please sign in to be able to save your work.')
		//   .should('be.visible')		
		// cy.get('div[class="icon large-account menu right topRightMenu"]').trigger('mouseover')
		// 	.then(() => {cy.contains("Sign In").click()
		// 		.then(() => {
		// 			cy.get('input[name=username]')
		// 				.type(email, {force: true})
		// 			cy.get('input[name=password]')
		// 				.type(password, {force: true})
		// 			cy.get('button[type=submit]')
		// 				.click()
		// 			cy.get('.right')
		// 				.should('be.visible')
		// 		})
		// 	})	
	})

	beforeEach(() => {
		Cypress.Cookies.preserveOnce('connect.sid')
	})

	it('Create new CBM', () => {
		// cy.wait(300)
		// cy.get('#app > div > div > div > div.heading.appBar > div.mainTopbar > div > ul > li > ul > li:nth-child(2) > ul > li:nth-child(1) > div > span').click({force: true})
		// cy.wait(5000)
	})

	it('Go to COMO - GIMME', () => {
		// cy.get('#app > div > div > div > div.heading.appBar > div:nth-child(2) > div > div > ul > li.Context_Specific')
		// 	.click()
		// cy.contains('GIMME').click()
	})

	it('Species/Taxon ID', () => {
		// cy.get('div[class="editable enabled editablePlaceholder"]')
		// 	.click()
		// 	.then(() => {
		// 		cy.get('input[spellcheck="false"]')
		// 		  .type('123456', {force: true})
		// 		  .type('{enter}')	
		// 	})
		// cy.contains('123456')
		// 	.should('be.visible')
	})

	it.skip('Save the Model after adding Taxon ID', () => {
		cy.contains("File").trigger("mouseover").then(() => {
			cy.contains("Save").click()});

		cy.wait(5000);
    cy.contains("Save").parent().parent().should("have.class", "disabled");
		cy.get('div[class="bar"]').first().click({force: true})
	})

	it('Data Selection', () => {
		// cy.contains('Bulk Total RNA Sequencing')
		// 	.should('be.visible')
		// cy.contains('Bulk PolyA RNA Sequencing')
		// 	.should('be.visible')
		// cy.contains('Single Cell RNA Sequencing (Pre Normalized)')
		// 	.should('be.visible')
		// cy.contains('Proteomics (Pre Normalized)')
		// 	.should('be.visible')				

		// cy.get('.scrollable').first().then($scrollable => {
		// 	const scrollable = $scrollable[0];
		// 	const scrollTop = scrollable.scrollTop;
		// 	const scrollHeight = scrollable.scrollHeight;
		// 	const clientHeight = scrollable.clientHeight;
		// 	const scrollbarPosition = scrollTop / (scrollHeight - clientHeight);
		// });
	})

	//
	it.skip('Bulk Total RNA Sequencing', () => {
		//Bulk Total RNA Sequencing check range and default values
		cy.contains('Bulk Total RNA Sequencing')
			.should('exist')
		cy.get('span[class="checkbox"]').eq(0).click()
		cy.get('span[class="icon base-menu dropdown-icon-closed"]').eq(0).click()
		//Minimum Activity Level
		cy.get('div.editable.enabled').eq(3)  
			.invoke('text')              
			.then((text) => {
				const value = parseFloat(text.trim());  
				cy.log('Default Lower Gene Activity Threshold: ' + value)         
				expect(value).to.equal(-3) 
			})
		cy.get('div.editable.enabled').eq(4)  
			.invoke('text')              
			.then((text) => {
				const value = parseFloat(text.trim());  
				cy.log('Default Lower Gene Activity Threshold: ' + value)         
				expect(value).to.equal(0.9) 
			})	
		cy.get('div.editable.enabled').eq(5)  
			.invoke('text')              
			.then((text) => {
				const value = parseFloat(text.trim());  
				cy.log('Default Lower Gene Activity Threshold: ' + value)         
				expect(value).to.equal(0.9) 
			})
		cy.get('div.editable.enabled').eq(6)  
			.invoke('text')              
			.then((text) => {
				const value = parseFloat(text.trim());  
				cy.log('Default Lower Gene Activity Threshold: ' + value)         
				expect(value).to.equal(0.9) 
			})	
		cy.get('div.editable.enabled').eq(7)  
			.invoke('text')              
			.then((text) => {
				const value = parseFloat(text.trim());  
				cy.log('Default Lower Gene Activity Threshold: ' + value)         
				expect(value).to.equal(0.9) 
			})			
		cy.get('.sliderInput .track div').eq(4)
			.realMouseDown()
			.realMouseMove(100000, 0)
			.realMouseUp()

		//import - need higher version of React (npm install --save-dev cypress-file-upload)
		//has to be imported cypress-file-upload: import 'cypress-file-upload';
		cy.get('input[name="bulk_rna_upload"]')//.attachFile('Total_RNA_sequencing.csv')
		cy.get('span[class="icon base-menu dropdown-icon-open"]').eq(0).click()
	})

	it.skip('Bulk PolyA RNA Sequencing', () => {
		cy.contains('Bulk PolyA RNA Sequencing')
			.should('exist')
		cy.get('span[class="checkbox"]').eq(0).click()
		cy.get('span[class="checkbox checked disabled"]').last().should('be.visible')
		cy.get('span[class="icon base-menu dropdown-icon-closed"]').eq(1).click()	
		cy.get('div.editable.enabled').eq(3)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(-3) 
		})
	cy.get('div.editable.enabled').eq(4)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(0.9) 
		})	
	cy.get('div.editable.enabled').eq(5)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(0.9) 
		})
	cy.get('div.editable.enabled').eq(6)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(0.9) 
		})	
	cy.get('div.editable.enabled').eq(7)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(0.9) 
		})
	
		//import - need higher version of React (npm install --save-dev cypress-file-upload)
		//has to be imported cypress-file-upload: import 'cypress-file-upload';
		cy.get('input[name="bulk_polya_rna_upload"]')//.attachFile('Total_RNA_sequencing.csv')		
		cy.get('span[class="icon base-menu dropdown-icon-open"]').eq(0).click()
	})

	it.skip('Single Cell RNA Sequencing (Pre Normalized)', () => {
		cy.contains('Single Cell RNA Sequencing (Pre Normalized)')
			.should('exist')
		cy.get('span[class="checkbox"]').eq(0).click()	
		cy.get('span[class="icon base-menu dropdown-icon-closed"]').eq(2).click()

		cy.get('div.editable.enabled').eq(3)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(0.9) 
		})
	cy.get('div.editable.enabled').eq(4)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(0.9) 
		})	
	cy.get('div.editable.enabled').eq(5)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(0.9) 
		})
	cy.get('div.editable.enabled').eq(6)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(0.9) 
		})	

		//import - need higher version of React (npm install --save-dev cypress-file-upload)
		//has to be imported cypress-file-upload: import 'cypress-file-upload';
		cy.get('input[name="bulk_polya_rna_upload"]')//.attachFile('Total_RNA_sequencing.csv')
		cy.get('span[class="icon base-menu dropdown-icon-open"]').eq(0).click()
	})

	it.skip('Proteomics (Pre Normalized)', () => {
		cy.contains('Proteomics (Pre Normalized)')
			.should('exist')	
		cy.get('span[class="checkbox"]').eq(0).click()
		cy.get('span[class="icon base-menu dropdown-icon-closed"]').eq(3).click()
		
		cy.get('div.editable.enabled').eq(3)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(0.9) 
		})
	cy.get('div.editable.enabled').eq(4)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(0.9) 
		})	
	cy.get('div.editable.enabled').eq(5)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(0.9) 
		})
	cy.get('div.editable.enabled').eq(6)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(0.9) 
		})	

		//import - need higher version of React (npm install --save-dev cypress-file-upload)
		//has to be imported cypress-file-upload: import 'cypress-file-upload';
		cy.get('input[name="proteomics_upload"]')//.attachFile('Total_RNA_sequencing.csv')
		cy.get('span[class="icon base-menu dropdown-icon-open"]').eq(0).click()
	})

	it.skip('Data Merging Settings', () => {
		cy.contains('Data Merging Settings')
			.should('be.visible')
		cy.get('span[class="icon base-menu dropdown-icon-closed"]').eq(4).click()
		//not tested
		cy.get('input[class="icon base-menu-gray"]').eq(0).click()
		cy.get('input[class="icon base-menu-gray"]').eq(0).click()

		cy.contains("Bulk Total RNA Sequencing:").eq(0).should('be.visible')
		cy.contains("Bulk PolyA RNA Sequencing:").eq(0).should('be.visible')
		cy.contains("Single Cell RNA Sequencing (Pre Normalized):").eq(0).should('be.visible')
		cy.contains("Proteomics (Pre Normalized):").eq(0).should('be.visible')

		cy.get('div.editable.enabled').eq(3)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(6) 
		})
	cy.get('div.editable.enabled').eq(4)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(6) 
		})	
	cy.get('div.editable.enabled').eq(5)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(6) 
		})
	cy.get('div.editable.enabled').eq(6)  
		.invoke('text')              
		.then((text) => {
			const value = parseFloat(text.trim());  
			cy.log('Default Lower Gene Activity Threshold: ' + value)         
			expect(value).to.equal(10) 
		})	
	})

	it.skip('Create Model', () => {
		cy.get('button[type="button"]').click()
		cy.contains("Please select a file to upload.").should('be.visible')
	})
})

