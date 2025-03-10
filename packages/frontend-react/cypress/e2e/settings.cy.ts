/// <reference types="cypress" />

import { baseURL } from '../fixtures';
import { register } from '../fixtures/users';

const viewportWidth = Cypress.env('viewportWidth') || 1280;
const viewportHeight = Cypress.env('viewportHeight') || 720;

describe('User Settings', { testIsolation: false }, () => {
    beforeEach(() => {
        cy.viewport(viewportWidth, viewportHeight);
    });

    it('Login account', () => {
        cy.visit(`${baseURL}/sign-in`);

        // API
        cy.intercept('POST', `/v1/user/login`).as('loginAccount');
        cy.intercept('GET', `/v1/user/profile`).as('profileCall');

        // valid data
        cy.get('[data-testid="email"]').clear().type(register.email);
        cy.get('[data-testid="email-error"]').should('include.text', '');
        cy.get('[data-testid="password"]').clear().type(register.newPassword);
        cy.get('[data-testid="password-error"]').should('include.text', '');
        cy.get('[data-testid="SUBMIT"]').click();

        cy.wait('@loginAccount').then((interception) => {
            if (interception.response?.statusCode === 403) {
                cy.wait('@loginAccount').then((interception) => {
                    expect(interception.response?.statusCode).to.equal(200);
                });
            } else expect(interception.response?.statusCode).to.equal(200);
        });
        cy.wait('@profileCall').then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
            expect(interception.response?.body?.data?.user?.userId).to.be.a(
                'string'
            );
        });
    });

    it('Update profile', () => {
        cy.visit(`${baseURL}/settings`);

        // API
        cy.intercept('PUT', `/v1/user/update`).as('updateProfile');

        // without data
        cy.get('[data-testid="name"]').clear();
        cy.get('[data-testid="name-error"]').should(
            'include.text',
            'Please enter your name'
        );

        // invalid data
        cy.get('[data-testid="name"]').type(register.password);
        cy.get('[data-testid="name-error"]').should(
            'include.text',
            'Invalid name'
        );

        // valid data
        cy.get('[data-testid="name"]').clear().type(register.newName);
        cy.get('[data-testid="name-error"]').should('include.text', '');
        cy.get('[data-testid="SUBMIT"]').click();

        cy.wait('@updateProfile').then((interception) => {
            if (interception.response?.statusCode === 403) {
                cy.wait('@updateProfile').then((interception) => {
                    expect(interception.response?.statusCode).to.equal(200);
                });
            } else {
                expect(interception.response?.statusCode).to.equal(200);
            }
        });
    });

    it('Change password', () => {
        cy.get('[data-testid="change_password_tab"]').click();

        // API
        cy.intercept('PUT', `/v1/user/update-password`).as('updatePassword');

        // without data
        cy.get('[data-testid="SUBMIT"]').click();
        cy.get('[data-testid="currentPassword-error"]').should(
            'include.text',
            'Please enter your current password'
        );
        cy.get('[data-testid="password-error"]').should(
            'include.text',
            'Please enter your password'
        );
        cy.get('[data-testid="confirmPassword-error"]').should(
            'include.text',
            'Please enter confirmation password'
        );

        // invalid data
        cy.get('[data-testid="password"]').type(register.name);
        cy.get('[data-testid="password-error"]').should(
            'include.text',
            'Password must contain at least one uppercase letter, one lower case, one number, one symbol(@$!%*?&#), and be at least 8 characters long'
        );
        cy.get('[data-testid="confirmPassword"]').type(register.name.slice(3));
        cy.get('[data-testid="confirmPassword-error"]').should(
            'include.text',
            'Password does not match'
        );

        // valid data
        cy.get('[data-testid="currentPassword"]')
            .clear()
            .type(register.newPassword);
        cy.get('[data-testid="password"]').clear().type(register.password);
        cy.get('[data-testid="password-error"]').should('include.text', '');
        cy.get('[data-testid="confirmPassword"]')
            .clear()
            .type(register.password);
        cy.get('[data-testid="confirmPassword-error"]').should(
            'include.text',
            ''
        );
        cy.get('[data-testid="SUBMIT"]').click();

        cy.wait('@updatePassword').then((interception) => {
            if (interception.response?.statusCode === 403) {
                cy.wait('@updatePassword').then((interception) => {
                    expect(interception.response?.statusCode).to.equal(200);
                });
            } else expect(interception.response?.statusCode).to.equal(200);
        });
    });

    it('App settings', () => {
        cy.get('[data-testid="setting_tab"]').click();
        cy.get('[data-testid="APP_SETTING_PAGE"]').should('exist');
    });
});
