/// <reference types="cypress" />

describe('ManageMe Application E2E Tests', () => {
    before(() => {
        cy.login();
    });

    beforeEach(() => {
        cy.visit('/');
        cy.contains('Projekty', { timeout: 10000 }).should('be.visible');
    });

    after(() => {
        cy.logout();
    });

    it('should complete full application workflow on single project', () => {
        const projectName = 'E2E Test Project';
        const projectDescription = 'Single project for all tests';
        const storyName = 'E2E Test Story';
        const storyDescription = 'Single story for all tests';
        const taskName = 'E2E Test Task';
        const taskDescription = 'Single task for all tests';


        cy.log('=== CREATING PROJECT ===');

        cy.get('input[id="projectName"]').clear().type(projectName);
        cy.get('textarea[id="projectDescription"]').clear().type(projectDescription);

        cy.get('form').first().within(() => {
            cy.get('button').contains('Dodaj').click();
        });

        cy.wait(2000);
        cy.contains(projectName, { timeout: 10000 }).should('be.visible');
        cy.contains(projectDescription).should('be.visible');


        cy.log('=== SELECTING PROJECT ===');
        cy.wait(1000);
        cy.contains('.bg-white', projectName).within(() => {
            cy.get('button').contains('Wybierz').click();
        });

        cy.wait(2000);
        cy.contains('Historyjki użytkownika', { timeout: 10000 }).should('be.visible');

        cy.log('=== CREATING STORY ===');
        cy.wait(1000);

        cy.get('input[id="storyName"]').clear().type(storyName);
        cy.get('textarea[id="storyDescription"]').clear().type(storyDescription);
        cy.get('select[id="storyPriority"]').select('wysoki');

        cy.contains('Historyjki użytkownika').parent().within(() => {
            cy.get('form').within(() => {
                cy.get('button').contains('Dodaj').click();
            });
        });

        cy.wait(3000);
        cy.contains(storyName, { timeout: 15000 }).should('be.visible');
        cy.contains(storyDescription, { timeout: 10000 }).should('be.visible');


        cy.log('=== SELECTING STORY ===');
        cy.wait(1000);

        cy.contains('.bg-white', storyName).within(() => {
            cy.get('button').contains('Wybierz').click();
        });

        cy.wait(2000);
        cy.contains('Zadania', { timeout: 10000 }).should('be.visible');


        cy.log('=== CREATING TASK ===');
        cy.wait(1000);

        cy.get('input[id="taskName"]').clear().type(taskName);
        cy.get('textarea[id="taskDescription"]').clear().type(taskDescription);
        cy.get('select[id="taskPriority"]').select('średni');

        cy.get('input[id="taskEstimatedTime"]').clear().type('3');

        cy.contains('Zadania').parent().within(() => {
            cy.get('form').within(() => {
                cy.get('button').contains('Dodaj').click();
            });
        });

        cy.wait(3000);
        cy.contains(taskName, { timeout: 15000 }).should('be.visible');
        cy.contains(taskDescription).should('be.visible');
        cy.contains('3h').should('be.visible');

        cy.log('=== EDITING TASK ===');
        cy.wait(1000);
        cy.contains('.bg-white', taskName).as('taskCard');

        cy.get('@taskCard').within(() => {
            cy.get('button').contains('Edytuj').click();
        });

        cy.wait(2000);
        cy.get('input[id="taskName"]').should('have.value', taskName);

        cy.get('input[id="taskName"]').clear().type(taskName + ' - EDITED');
        cy.get('textarea[id="taskDescription"]').clear().type(taskDescription + ' - EDITED');
        cy.get('select[id="taskPriority"]').select('niski');
        cy.get('input[id="taskEstimatedTime"]').clear().type('5');


        cy.wait(1000);
        cy.contains('Zadania').parent().within(() => {
            cy.get('form').within(() => {
                cy.get('button').then(($buttons) => {

                    const updateButton = $buttons.filter(':contains("Aktualizuj")');
                    if (updateButton.length > 0) {
                        cy.wrap(updateButton.first()).click();
                    } else {
                        cy.wrap($buttons.first()).click();
                    }
                });
            });
        });

        cy.wait(3000);
        cy.contains(taskName + ' - EDITED', { timeout: 10000 }).should('be.visible');


        cy.log('=== EDITING STORY ===');
        cy.wait(1000);
        cy.contains('Historyjki użytkownika').should('be.visible');

        cy.contains('.bg-white', storyName).within(() => {
            cy.get('button').contains('Edytuj').click();
        });

        cy.wait(2000);
        cy.get('input[id="storyName"]').should('have.value', storyName);
        cy.get('input[id="storyName"]').clear().type(storyName + ' - EDITED');
        cy.get('textarea[id="storyDescription"]').clear().type(storyDescription + ' - EDITED');
        cy.get('select[id="storyPriority"]').select('niski');

        cy.wait(1000);
        cy.contains('Historyjki użytkownika').parent().within(() => {
            cy.get('form').within(() => {
                cy.get('button').then(($buttons) => {
                    const updateButton = $buttons.filter(':contains("Aktualizuj")');
                    if (updateButton.length > 0) {
                        cy.wrap(updateButton.first()).click();
                    } else {
                        cy.wrap($buttons.first()).click();
                    }
                });
            });
        });

        cy.wait(3000);
        cy.contains(storyName + ' - EDITED', { timeout: 10000 }).should('be.visible');


        cy.log('=== EDITING PROJECT ===');
        cy.wait(1000);
        cy.contains('Projekty').should('be.visible');

        cy.contains('.bg-white', projectName).within(() => {
            cy.get('button').contains('Edytuj').click();
        });

        cy.wait(2000);

        cy.get('input[id="projectName"]').should('have.value', projectName);
        cy.get('input[id="projectName"]').clear().type(projectName + ' - EDITED');
        cy.get('textarea[id="projectDescription"]').clear().type(projectDescription + ' - EDITED');


        cy.wait(1000);
        cy.get('form').first().within(() => {
            cy.get('button').then(($buttons) => {
                const updateButton = $buttons.filter(':contains("Aktualizuj")');
                if (updateButton.length > 0) {
                    cy.wrap(updateButton.first()).click();
                } else {
                    cy.wrap($buttons.first()).click();
                }
            });
        });

        cy.wait(3000);
        cy.contains(projectName + ' - EDITED', { timeout: 10000 }).should('be.visible');
        cy.contains(projectDescription + ' - EDITED').should('be.visible');

        cy.log('=== CLEANUP ===');


        cy.contains('.bg-white', projectName + ' - EDITED').within(() => {
            cy.get('button').contains('Wybierz').click();
        });
        cy.wait(2000);


        cy.contains('.bg-white', storyName + ' - EDITED').within(() => {
            cy.get('button').contains('Wybierz').click();
        });
        cy.wait(2000);
        cy.contains('Zadania').should('be.visible');
        cy.wait(1000);


        cy.contains('.bg-white', taskName + ' - EDITED').within(() => {
            cy.get('button').contains('Usuń').click();
        });
        cy.wait(2000);


        cy.contains('Historyjki użytkownika').should('be.visible');
        cy.wait(1000);
        cy.contains('.bg-white', storyName + ' - EDITED').within(() => {
            cy.get('button').contains('Usuń').click();
        });
        cy.wait(2000);


        cy.contains('Projekty').should('be.visible');
        cy.wait(1000);
        cy.contains('.bg-white', projectName + ' - EDITED').within(() => {
            cy.get('button').contains('Usuń').click();
        });
        cy.wait(2000);

        cy.log('=== ALL TESTS COMPLETED SUCCESSFULLY ===');
    });
});