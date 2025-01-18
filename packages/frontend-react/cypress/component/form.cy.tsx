/// <reference types="cypress" />

import React from 'react';
import { FormBuilder } from '../../src/app/components/form/main';

describe('Form component', () => {
    it('Multiple fields check', () => {
        cy.mount(
            <FormBuilder
                form={{
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
                }}
                call={async (_) => {
                    return false;
                }}
                buttonText="Login"
            />
        );

        cy.get('label[for="name"]').should('include.text', 'Enter your name');
        cy.get('input[name="name"]').should('exist');
        cy.get('[data-testid="name-error"]').should('include.text', '');
        cy.get('label[for="email"]').should('include.text', 'Enter your email');
        cy.get('input[name="email"]').should('exist');
        cy.get('[data-testid="email-error"]').should('include.text', '');

        cy.get('[data-testid="SUBMIT"]').click();
        cy.get('[data-testid="name-error"]').should(
            'include.text',
            'Please enter your name'
        );
        cy.get('[data-testid="email-error"]').should(
            'include.text',
            'Please enter your email'
        );
    });
});
