/// <reference types="cypress" />

import { baseURL } from '../fixtures';
import { register } from '../fixtures/users';

const viewportWidth = Cypress.env('viewportWidth') || 1280;
const viewportHeight = Cypress.env('viewportHeight') || 720;

describe('Authentication', () => {
    let token = '';

    beforeEach(() => {
        cy.viewport(viewportWidth, viewportHeight);
    });

    it('Create account', () => {
        cy.visit(`${baseURL}/sign-up`);

        // API
        cy.intercept('POST', `/v1/user/create`).as('createAccount');

        // without data
        cy.get('[data-testid="SUBMIT"]').click();
        cy.get('[data-testid="name-error"]').should(
            'include.text',
            'Please enter your name'
        );
        cy.get('[data-testid="email-error"]').should(
            'include.text',
            'Please enter your email'
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
        cy.get('[data-testid="email"]').type(register.name);
        cy.get('[data-testid="email-error"]').should(
            'include.text',
            'Invalid email'
        );
        cy.get('[data-testid="password"]').type(register.name);
        cy.get('[data-testid="password-error"]').should(
            'include.text',
            'Password must contain at least one uppercase letter, one lower case, one number, one symbol(@$!%*?&#), and be at least 8 characters long'
        );

        // valid data
        cy.get('[data-testid="name"]').clear().type(register.name);
        cy.get('[data-testid="name-error"]').should('include.text', '');
        cy.get('[data-testid="email"]').clear().type(register.email);
        cy.get('[data-testid="email-error"]').should('include.text', '');
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

        cy.wait('@createAccount').then((interception) => {
            token = interception.response?.body?.message;
            expect(interception.response?.statusCode).to.equal(200);
        });
    });

    it('Verify user account', () => {
        cy.visit(`${baseURL}/verify?token=${register.email}`);
        cy.get('[data-testid="MESSAGE"]').should(
            'include.text',
            'Unauthorized'
        );

        cy.visit(`${baseURL}/verify?token=${token}`);

        cy.get('[data-testid="MESSAGE"]').should(
            'include.text',
            'Account verified'
        );
    });

    it('Login account', () => {
        cy.visit(`${baseURL}/sign-in`);

        // API
        cy.intercept('POST', `/v1/user/login`).as('loginAccount');
        cy.intercept('GET', `/v1/user/profile`).as('profileCall');

        // without data
        cy.get('[data-testid="SUBMIT"]').click();
        cy.get('[data-testid="email-error"]').should(
            'include.text',
            'Please enter your email'
        );
        cy.get('[data-testid="password-error"]').should(
            'include.text',
            'Please enter your password'
        );

        // invalid data
        cy.get('[data-testid="email"]').type(register.name);
        cy.get('[data-testid="email-error"]').should(
            'include.text',
            'Invalid email'
        );

        // valid data
        cy.get('[data-testid="email"]').clear().type(register.email);
        cy.get('[data-testid="email-error"]').should('include.text', '');
        cy.get('[data-testid="password"]').clear().type(register.password);
        cy.get('[data-testid="password-error"]').should('include.text', '');
        cy.get('[data-testid="SUBMIT"]').click();

        cy.wait('@loginAccount').then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
        });
        cy.wait('@profileCall').then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
            expect(interception.response?.body?.data?.user?.userId).to.be.a(
                'string'
            );
        });
    });

    it('Forgot password', () => {
        cy.visit(`${baseURL}/forgot-password`);

        // API
        cy.intercept('POST', `/v1/user/request-reset-password`).as(
            'forgotPassword'
        );

        // without data
        cy.get('[data-testid="SUBMIT"]').click();
        cy.get('[data-testid="email-error"]').should(
            'include.text',
            'Please enter your email'
        );

        // invalid data
        cy.get('[data-testid="email"]').type(register.name);
        cy.get('[data-testid="email-error"]').should(
            'include.text',
            'Invalid email'
        );

        // valid data
        cy.get('[data-testid="email"]').clear().type(register.email);
        cy.get('[data-testid="email-error"]').should('include.text', '');
        cy.get('[data-testid="SUBMIT"]').click();

        cy.wait('@forgotPassword').then((interception) => {
            token = interception.response?.body?.message;
            expect(interception.response?.statusCode).to.equal(200);
        });
    });

    it('Reset password', () => {
        cy.visit(`${baseURL}/reset-password?token=${token}`);

        // API
        cy.intercept('POST', `/v1/user/change-password`).as('changePassword');

        // without data
        cy.get('[data-testid="SUBMIT"]').click();
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
        cy.get('[data-testid="password"]').clear().type(register.newPassword);
        cy.get('[data-testid="password-error"]').should('include.text', '');
        cy.get('[data-testid="confirmPassword"]')
            .clear()
            .type(register.newPassword);
        cy.get('[data-testid="confirmPassword-error"]').should(
            'include.text',
            ''
        );
        cy.get('[data-testid="SUBMIT"]').click();

        cy.wait('@changePassword').then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
        });
    });

    it('Block reuse of change password link', () => {
        // API
        cy.intercept('POST', `/v1/user/change-password`).as('changePassword');

        cy.visit(`${baseURL}/reset-password?token=${token}`);

        // Validating with valid data
        cy.get('[data-testid="password"]').clear().type(register.password);
        cy.get('[data-testid="password-error"]').should('include.text', '');
        cy.get('[data-testid="confirmPassword"]')
            .clear()
            .type(register.password);
        cy.get('[data-testid="confirmPassword-error"]').should(
            'include.text',
            ''
        );
        cy.get('[data-testId="SUBMIT"]').click();

        cy.wait('@changePassword').then((interception) => {
            expect(interception.response?.statusCode).to.equal(400);
            expect(interception.response?.body?.message).to.equal(
                'Password change failed'
            );
        });
    });

    it('Invalid password attempt and account lock', () => {
        cy.intercept('POST', `/v1/user/login`).as('loginAccount');
        cy.visit(`${baseURL}/sign-in`);

        for (const _ of new Array(3).fill(null)) {
            cy.get('[data-testId="email"]').clear().type(register.email);
            cy.get('[data-testId="password"]').clear().type(register.password);
            cy.get('[data-testId="SUBMIT"]').click();

            cy.wait('@loginAccount').then((interception) => {
                expect(interception.response?.statusCode).to.equal(400);
            });
            cy.get('[data-testId="TOAST"]').should(
                'include.text',
                `Invalid credential`
            );
        }

        cy.get('[data-testId="email"]').clear().type(register.email);
        cy.get('[data-testId="password"]').clear().type(register.password);
        cy.get('[data-testId="SUBMIT"]').click();
        cy.get('[data-testId="TOAST"]').should(
            'include.text',
            `Your account is suspended. It will be resumed in 1 minutes due to 3 invalid credential attempts`
        );
        cy.wait('@loginAccount').then((interception) => {
            expect(interception.response?.statusCode).to.equal(400);
        });

        cy.wait(60000);

        cy.get('[data-testId="email"]').clear().type(register.email);
        cy.get('[data-testId="password"]').clear().type(register.newPassword);
        cy.get('[data-testId="SUBMIT"]').click();
        cy.wait('@loginAccount').then((interception) => {
            expect(interception.response?.statusCode).to.equal(200);
        });
    });

    it('Token expiry after the expiry limit reach', () => {
        cy.intercept('GET', `/v1/user/profile`).as('profileCall');

        cy.visit(baseURL);
        cy.wait(60500);
        cy.reload();

        cy.wait('@profileCall').then((interception) => {
            expect(interception.response?.statusCode).to.equal(401);
        });
    });
});
