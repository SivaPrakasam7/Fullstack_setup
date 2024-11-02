/// <reference types="cypress" />

import Main from 'src/app/components/form/main.vue';

describe('Form component', () => {
    it('Multiple fields check', () => {
        cy.mount(Main, {
            props: {
                form: {
                    name: {
                        label: 'Enter your name',
                        placeHolder: 'John',
                        type: 'text',
                        required: true,
                        value: '',
                        requiredLabel: 'Please enter your name',
                    },
                    email: {
                        label: 'Enter your email',
                        placeHolder: 'example@mail.com',
                        type: 'text',
                        required: true,
                        value: '',
                        requiredLabel: 'Please enter your email',
                    },
                },
                buttonText: 'Login',
            },
        });

        cy.get('label[for="name"]').should('include.text', 'Enter your name');
        cy.get('input[name="name"]').should('exist');
        cy.get('[data-testId="name-error"]').should('include.text', '');
        cy.get('label[for="email"]').should('include.text', 'Enter your email');
        cy.get('input[name="email"]').should('exist');
        cy.get('[data-testId="email-error"]').should('include.text', '');

        cy.get('[data-testId="SUBMIT"]').click();
        cy.get('[data-testId="name-error"]').should(
            'include.text',
            'Please enter your name'
        );
        cy.get('[data-testId="email-error"]').should(
            'include.text',
            'Please enter your email'
        );
    });
});
