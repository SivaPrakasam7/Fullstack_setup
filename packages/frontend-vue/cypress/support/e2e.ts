// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')
import { slowCypressDown } from 'cypress-slow-down';

slowCypressDown(200);

Cypress.Commands.add('customSelect', (name, option, autoSelect = false) => {
    if (autoSelect) cy.get(`[data-testid="${name}"]`).click();
    else cy.get(`[data-testid="${name}-select"]`).click();
    cy.get(`[data-testid="${name}-menu"]`)
        .get(`[data-testid="${option}"]`)
        .click({ force: true });
});

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            customSelect(
                name: string,
                option: string,
                autoSelect?: boolean
            ): Chainable<void>;
        }
    }
}
