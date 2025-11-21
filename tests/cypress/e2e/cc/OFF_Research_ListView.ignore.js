Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

context('Listview', () => {

	const URL = Cypress.env('CC_TEST_URL') ||  'http://localhost:5000/'
 
    before(() => {
      cy.visit(URL)
			cy.get('a[class=button-three]')
			  .click({force: true})  
    })

		it('Switch to listview', () => {
			cy.get('div[class="icon base-list-view"]').filter(':visible').click()
		})
			
		it('Check if models are visible', () => {
			cy.get('table[class="list-view cell-border dataTable"]').should('be.visible')
			cy.get('#recentlyPublishedTable tbody tr').should('have.length.greaterThan', 0);
		})

		it('Sort models by Name', () => {
			cy.get('th[data-translate="name"]').filter(':visible').click();
			cy.get('#recentlyPublishedTable tbody tr td:nth-child(2)')
			.then(($cells) => {
				const count = Math.min($cells.length, 20);
				const names = $cells.slice(0, count).map((index, el) => Cypress.$(el).text()).get();
				console.log(names);
				names.forEach(name => expect(name).to.not.be.empty);
			});
			
		})

		it('Sort models by Type', () => {
			cy.get('th[data-translate="type"]').filter(':visible').click();
			cy.get('#recentlyPublishedTable tbody tr td:nth-child(3)')
				.then(($cells) => {
					const count = Math.min($cells.length, 20);
					const types = $cells.slice(0, count).map((index, el) => Cypress.$(el).text()).get();
					console.log(types);
					types.forEach(type => expect(type).to.not.be.empty);
					const sortedTypes = [...types].sort();
					expect(types).to.deep.equal(sortedTypes);
				});
		});

		it('Sort models by Author', () => {
			cy.get('th[data-translate="author"]').filter(':visible').click();
			cy.get('#recentlyPublishedTable tbody tr td:nth-child(6)')
				.then(($cells) => {
					const count = Math.min($cells.length, 20);
					const authors = $cells.slice(0, count).map((index, el) => Cypress.$(el).text()).get();
					console.log(authors);
					authors.forEach(author => expect(author).to.not.be.empty);
					const sortedAuthors = [...authors].sort();
					expect(authors).to.deep.equal(sortedAuthors);
				});
		});
	})
		
