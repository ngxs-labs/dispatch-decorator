/// <reference types="cypress" />

describe('Server side rendering', () => {
  const indexUrl = '/';

  it('successfully render index page', () => {
    cy.request(indexUrl)
      .its('body')
      .should('contain', 'Counter is 0');
  });

  it('should increment and decrement after button clicks', () => {
    cy.visit(indexUrl)
      .get('button.increment')
      // Increment 5 times
      .click()
      .click()
      .click()
      .click()
      .click()
      .get('button.decrement')
      .click()
      .click()
      .click()
      .get('h1.counter')
      .should('contain', 'Counter is 2');
  });
});
