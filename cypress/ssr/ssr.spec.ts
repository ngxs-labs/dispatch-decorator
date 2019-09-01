/// <reference types="cypress" />

describe('Server side rendering', () => {
  const indexUrl = '/';

  it('successfully render index page', () => {
    // Arrange & act & assert
    cy.request(indexUrl)
      .its('body')
      .should('contain', 'Counter is 0');
  });

  it('should increment and decrement after button clicks', () => {
    // Arrange & act & assert
    cy.visit(indexUrl)
      .get('button.increment')
      // Increment 5 times
      .click()
      .click()
      .click()
      .click()
      .click()
      .get('button.decrement')
      // Decrement 3 times
      .click()
      .click()
      .click()
      .get('h1.counter')
      .should('contain', 'Counter is 2');
  });

  it('should increment but cancel previously uncompleted async job', () => {
    // Arrange & act & assert
    cy.visit(indexUrl)
      .get('button.increment-async')
      // Try to increment 3 times
      .click()
      .click()
      .click()
      .get('h1.counter')
      .should('contain', 'Counter is 1');
  });
});
