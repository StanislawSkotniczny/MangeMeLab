/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<Element>;
      logout(): Chainable<Element>;
      createProject(name: string, description: string): Chainable<Element>;
      selectProject(projectName: string): Chainable<Element>;
      createStory(name: string, description: string, priority?: string): Chainable<Element>;
      selectStory(storyName: string): Chainable<Element>;
      createTask(name: string, description: string, priority?: string, estimatedTime?: number): Chainable<Element>;
      submitForm(): Chainable<Element>;
    }
  }
}

Cypress.Commands.add('login', () => {
  cy.visit('/');
  cy.wait(2000);

  cy.get('body').then(($body) => {
    if ($body.text().includes('Projekty') && !$body.find('#email').length) {
      cy.log('Already logged in, skipping login process');
      return;
    }

    cy.log('Not logged in, performing login');
    cy.get('#email', { timeout: 10000 }).should('be.visible').type('test@example.com');
    cy.get('#password', { timeout: 5000 }).should('be.visible').type('testpassword123');
    cy.get('button[type="submit"]').click();

    cy.contains('Projekty', { timeout: 15000 }).should('be.visible');
  });
});

Cypress.Commands.add('submitForm', () => {
  cy.get('form').within(() => {
    cy.get('button[type="submit"]').then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
      } else {
        cy.get('button').first().click();
      }
    });
  });
});

Cypress.Commands.add('createProject', (name: string, description: string) => {
  cy.contains('Projekty').should('be.visible');

  cy.get('input[id="name"]').clear().type(name);
  cy.get('textarea[id="description"]').clear().type(description);

  cy.submitForm();

  cy.contains(name, { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('selectProject', (projectName: string) => {
  cy.contains('.bg-white', projectName).within(() => {
    cy.get('button').contains('Wybierz').click();
  });

  cy.contains('Historie użytkownika', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('createStory', (name: string, description: string, priority: string = 'średni') => {
  cy.contains('Historie użytkownika').should('be.visible');

  cy.get('input[id="storyName"]').clear().type(name);
  cy.get('textarea[id="storyDescription"]').clear().type(description);
  cy.get('select[id="storyPriority"]').select(priority);

  cy.submitForm();

  cy.contains(name, { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('selectStory', (storyName: string) => {
  cy.contains('h3', storyName).click();
  cy.contains('Zadania', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('createTask', (name: string, description: string, priority: string = 'średni', estimatedTime: number = 2) => {
  cy.contains('Zadania').should('be.visible');

  cy.get('input[id="taskName"]').clear().type(name);
  cy.get('textarea[id="taskDescription"]').clear().type(description);
  cy.get('select[id="taskPriority"]').select(priority);
  cy.get('input[id="estimatedTime"]').clear().type(estimatedTime.toString());

  cy.submitForm();

  cy.contains(name, { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('logout', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.reload();
});

export { };