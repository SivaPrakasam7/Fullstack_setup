import { defineConfig } from 'cypress';

export default defineConfig({
    waitForAnimations: true,
    video: false,
    e2e: {
        setupNodeEvents() {
            // implement node event listeners here
        },
        specPattern: ['cypress/e2e/authentication.cy.ts'],
    },
    component: {
        devServer: {
            framework: 'vue',
            bundler: 'vite',
        },
        specPattern: ['cypress/component/'],
    },
});
