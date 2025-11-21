/**
 * @author: Eric Kioko
 */
Cypress.on("uncaught:exception", (err, runnable) => {
  return false;
});

Cypress.config("viewportWidth", 1366); // to enable drag and drop for reactants and products

const modelName = "Research CBM Model";
const sampleReferenceDOI = "10.1186/s12898-019-0263-7";
const mA_Description = "metabolite mA description.";
const mB_Description = "metabolite mB description.";
const path = require("path");
const downloadsFolder = Cypress.config("downloadsFolder");

context("Import Constraint-Based model", () => {
  const URL =
    Cypress.env("CC_TEST_URL") || "https://research.cellcollective.org/"; //"http://localhost:5000"; // "https://hotfix-teach.cellcollective.org"; //    'https://develop.cellcollective.org/#'
  const teacher_email =
    Cypress.env("CC_TEST_USERNAME") || "cchlteachertest@gmail.com";
  const teacher_password = Cypress.env("CC_TEST_USERNAME") || "Teacher_tests1"; //"h9LtAhhZAq"; // Change before push //For server
	// const teacher_password = Cypress.env("CC_TEST_USERNAME") || "h9LtAhhZAq"; //"h9LtAhhZAq"; // For dev


  /** log in as a researcher before each spec */
  beforeEach(() => {
    cy.visit(URL);
    cy.clearCookies();
    cy.get("a[class=button-three]").click({ force: true });
    cy.get(".logoImg")
      .should("have.attr", "src")
      .and("include", "/assets/images/logo/research/logo.png");
    cy.get('div[class="icon large-account menu right topRightMenu"]')
      .trigger("mouseover")
      .then(() => {
        cy.wait(5000);
        cy.contains("Research Platform").click();
        cy.get('div[class="icon large-account menu right topRightMenu"]')
          .trigger("mouseover")
          .then(() => {
            cy.contains("Sign In")
              .click()
              .then(() => {
                cy.get('input[name="username"]').clear().type(teacher_email);
                cy.get('input[type="password"]').clear().type(teacher_password);
                cy.get('button[type="submit"]').click().wait(5000);
              });
          });
      });
  });

  it("create constrain based model and download it", () => {
    /** create new model */
		cy.wait(10000)
    cy.contains("New Model").trigger("mouseover");
    cy.contains("Constraint-Based Model").trigger("mouseover").wait(1000);
    cy.get(
      "#app > div > div > div > div.heading.appBar > div.mainTopbar > div > ul > li > ul > li:nth-child(2) > ul > li:nth-child(1) > div > span"
    )
      .click({ force: true })
      .wait(5000);
    cy.contains("New Model").should("be.visible");
    // Rename the model
    cy.contains("New Model")
      .click()
      .then(() => {
        cy.get('form[class="editable menu"]')
          .find("input")
          .clear({ force: true })
          .type(modelName);
      });

    // Add metabolites mA
    cy.get('input[class="icon base-add"]').first().click().wait(500);
    // add description & reference for metabolite mA
    cy.get('div[class="view"]')
      .eq(4)
      .find('input[class="icon base-add"]')
      .first()
      .click()
      .then(() => {
        cy.get('div[class="editable enabled def togglePmid"]')
          .click()
          .then(() => {
            cy.get('form[class="editable menu togglePmid"]')
              .find("input")
              .type(`${mA_Description}{enter}`);
            // add reference
            cy.get('input[class="icon base-reference"]')
              .first()
              .click()
              .then(() => {
                cy.get('div[class="editable enabled def togglePmid"]')
                  .click()
                  .then(() => {
                    cy.get('form[class="editable menu togglePmid"]')
                      .find("input")
                      .type(`${sampleReferenceDOI}{enter}`);
                  });
              });
          });
      });
    // add metabolite mB
    cy.get('input[class="icon base-add"]').eq(1).click().wait(500);
    // add description & reference for metabolite mB
    cy.get('div[class="view"]')
      .eq(4)
      .find('input[class="icon base-add"]')
      .first()
      .click()
      .then(() => {
        cy.get('div[class="editable enabled def togglePmid"]')
          .click()
          .then(() => {
            cy.get('form[class="editable menu togglePmid"]')
              .find("input")
              .type(`${mB_Description}{enter}`);
            // add reference
            cy.get('input[class="icon base-reference"]')
              .first()
              .click()
              .then(() => {
                cy.get('div[class="editable enabled def togglePmid"]')
                  .click()
                  .then(() => {
                    cy.get('form[class="editable menu togglePmid"]')
                      .find("input")
                      .type(`${sampleReferenceDOI}{enter}`);
                  });
              });
          });
      });
    // add reaction
    cy.get('input[class="icon base-add"]').eq(2).click().wait(500);
    // add reactant and product
    cy.document().then((doc) => {
      const droppableDiv = doc.querySelectorAll('div[class="droppable"]');
      // const tables = doc.querySelectorAll("table");
      const tdOne = doc.querySelector(
        "#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table:nth-child(1) > tbody > tr:nth-child(1) > td:nth-child(1)"
      );
      const tdTwo = doc.querySelector(
        "#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table.selected > tbody > tr > td:nth-child(1)"
      );

      cy.dragAndDrop(tdOne, droppableDiv[0]);
      cy.wait(300);
      cy.dragAndDrop(tdTwo, droppableDiv[1]);
      cy.wait(300);
    });
    // save model and download SBML file
    cy.contains("File").trigger("mouseover");
    cy.contains("Save")
      .click()
      .then(() => {
        cy.wait(1000); // wait for it to be saved
        // confirm the model was saved
        cy.contains("Save").parent().parent().should("have.class", "disabled");
        // Download logical model
        cy.contains("File").trigger("mouseover");
        cy.contains("Download").trigger("mouseover");
        cy.contains("SBML")
          .click({ force: true })
          .then(() => {
            cy.readFile(
              path.join(downloadsFolder, `${modelName} (SBML).sbml`)
            ).should("exist");
            // cy.contains("Download SBML completed!").should("be.visible");
            // cy.get('input[value="OK"]')
            //   .click()
            //   .then(() => {
            //     cy.readFile(
            //       path.join(downloadsFolder, `${modelName} (SBML).sbml`)
            //     ).should("exist");
            //   });
          });
      });
  });

  it("import constraint based model and check components", () => {
    cy.contains("New Model").trigger("mouseover");
    cy.contains("Constraint-Based Model")
      .trigger("mouseover")
      .then(() => {
        // import model
        cy.get('input[name="fileImportInput"]')
          .first()
          .selectFile(path.join(downloadsFolder, `${modelName} (SBML).sbml`), {
            force: true,
          });
        cy.wait(9000);
        //save imported model
        cy.contains("File").trigger("mouseover");
        cy.contains("Save");
        //graph is visible
        cy.get("#graph").should('exist');
        //metabolites are visible
        cy.get(
          "#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(1) > td:nth-child(1)"
        ).should("exist");
        cy.get(
          "#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(2) > td:nth-child(1)"
        ).should("exist");
        //reactions are visible
        cy.get(
          "#app > div > div > div > div.arrangement > div:nth-child(4) > div > div.content > div > div > div > div.scrollable > div > table.selected > tbody > tr > td.editable.float"
        ).should("exist");
        //check if description and references are in knowledge base
        // mA
        cy.get(
          "#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(1) > td:nth-child(1)"
        )
          .click({ force: true })
          .then(() => {
            cy.get(
              "#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > div.editable.enabled > span"
            ).should("have.text", `${mA_Description}`); // description
            cy.get(
              "#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div:nth-child(1) > div > div > ol > div > li > div > span > span > a:nth-child(1)"
            ).should("exist"); // reference
          });
        // mB
        cy.get(
          "#app > div > div > div > div.arrangement > div:nth-child(3) > div > div.content > div > div > div > div.scrollable > div > table > tbody > tr:nth-child(2) > td:nth-child(1)"
        )
          .click({ force: true })
          .then(() => {
            cy.get(
              "#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div > div > ul > div > li > div > div.editable.enabled > span"
            ).should("have.text", `${mB_Description}`); // description
            cy.get(
              "#app > div > div > div > div.arrangement > div:nth-child(6) > div > div.content > div > div > div > div > div:nth-child(1) > div > div > ol > div > li > div > span > span > a:nth-child(1)"
            ).should("exist"); // reference
          });
      });
  });
});
