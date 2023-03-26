/// <reference types="cypress" />

describe('Server side rendering', () => {
  const indexUrl = '/';

  it('should make concurrent requests and app should render correctly for each request', async () => {
    const promises: Promise<string>[] = Array.from({ length: 50 }).map(() =>
      fetch('/').then(res => res.text())
    );

    const bodies = await Promise.all(promises);

    bodies.forEach(body => {
      expect(body).to.contain('Toggle counter component');
    });
  });

  it('successfully render index page', () => {
    // Arrange & act & assert
    cy.request(indexUrl).its('body').should('contain', 'Counter is 0');
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
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.visit(indexUrl)
      .get('button.increment-async')
      // Try to increment 3 times
      .click()
      .click()
      .click()
      .wait(600)
      .get('h1.counter')
      .should('contain', 'Counter is 1');
  });
});
