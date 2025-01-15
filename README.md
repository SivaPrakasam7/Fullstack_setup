# Fullstack setup

[![Lerna](https://img.shields.io/badge/Maintained%20with-Lerna-cc00ff.svg)](https://lerna.js.org/)
[![Vite](https://img.shields.io/badge/Created%20with-Vite-ddbb00.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/Developed%20with-React-61DAFB.svg)](https://reactjs.org/)
[![Vue](https://img.shields.io/badge/Developed%20with-Vue-42b883.svg)](https://vuejs.org/)
[![Typescript](https://img.shields.io/badge/Support-Typescript-3178c6.svg)](https://vitejs.dev/)
[![Cypress](https://img.shields.io/badge/Tested%20with-Cypress-007780.svg)](https://www.cypress.io/)
[![Nginx](https://img.shields.io/badge/Deployed%20on-Nginx-00b140.svg)](https://nginx.org/en/download.html)
[![Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind%20CSS-06b6d4.svg)](https://tailwindcss.com/)
[![Prettier](https://img.shields.io/badge/Formatted%20with-Prettier-f7b93e.svg)](https://prettier.io/)
[![ESLint](https://img.shields.io/badge/Linted%20with-ESLint-4b32c3.svg)](https://eslint.org/)
[![Husky](https://img.shields.io/badge/Git%20hooks%20by-Husky-d36ac2.svg)](https://typicode.github.io/husky/#/)

## Quick Working Preview

### Setup and test command

The project includes ready-to-use bash scripts to streamline setup, database management, and testing. These scripts simplify the process, but if you're using an unsupported OS, you can execute the commands manually as outlined in the script files.

## Setup and Test

<video src="doc/setup_and_test.mp4" autoplay loop muted width="600"></video>

1. **Setup and Initialization**  
   Run `init.sh` to install dependencies and set up the backend database migrations:

    ```bash
    ./init.sh
    ```

2. **Database Management**
   Use `db.sh` to reset the database and apply migrations. Pass your MySQL credentials as arguments:

    ```bash
    ./db.sh -u <mysql_user> -p <mysql_password>
    ```

3. **Run Tests**
   Execute all tests, including backend tests and Cypress E2E tests, using `test.sh`:

    ```bash
    ./test.sh
    ```

    This script will:

    - Run backend tests.
    - Start frontend and backend services.
    - Execute Cypress component and E2E tests.

| Script    | Purpose                                                                                      |
| --------- | -------------------------------------------------------------------------------------------- |
| `init.sh` | Installs dependencies and runs backend migrations.                                           |
| `db.sh`   | Drops and recreates the database, applies migrations, and cleans up log/backups directories. |
| `test.sh` | Runs backend tests, Cypress component tests, and E2E tests.                                  |

### Cypress E2E Test Execution

Below is a demonstration of the Cypress End-to-End (E2E) Test Execution, showcasing the authentication flow

<img src="doc/authentication.gif" alt="Demo of Cypress E2E Testcase" width="700"/>

## Table of Contents

-   [Project Setup](#project-setup)
-   [Technologies](#technologies)
    -   [Frontend](#frontend)
    -   [Backend](#backend)
    -   [Database](#database)
    -   [Additional Tools](#additional-tools)
    -   [Testing and CI/CD](#testing-and-cicd)
-   [Key Features](#key-features)
-   [Code Architecture Flow Diagram](#code-architecture-flow-diagram)
-   [Installation](#installation)
-   [Development Workflow](#development-workflow)
-   [Deployment](#deployment)
-   [GitHub Actions Workflow](#github-actions-workflow)

## Project Setup

This repository provides a **common project setup** for web apps using **React**, **Vue**, **Node.js**, and essential tools for frontend and backend development, testing, and automation.

## Technologies

### Frontend

-   **React & Vue**: Popular frontend framework for building user interfaces.
-   **Vite**: Fast build tool for modern web development with support for hot module replacement.
-   **TypeScript**: Superset of JavaScript providing static typing for better code quality.
-   **Tailwind CSS**: Utility-first CSS framework for quickly styling components.
-   **Service Worker**: Enables background tasks and improves performance in Progressive Web Apps (PWA).
-   **Vite Plugins**: Added for optimizing PWA features and removing unnecessary test case IDs in production builds.

### Backend

-   **Node.js**: JavaScript runtime for building scalable backend services.
-   **Error/Security Middlewares**: Handles error responses, security measures, and logs access/errors for auditing.
-   **Swagger**: Used for API documentation, providing a user-friendly interface to explore and test API endpoints.

### Database

-   **MySQL**: Relational database used for storing and managing data.

### Additional Tools

-   **Lerna**: Monorepo tool to manage multiple projects and dependencies.
-   **Prettier**: Code formatter that ensures consistent coding styles.
-   **ESLint**: Linter for identifying and fixing code quality issues.
-   **JSCPD**: Tool for detecting duplicate code across the codebase.
-   **Husky**: Git hooks tool used for running automated tasks such as code formatting with Prettier and linting with ESLint during pre-commit.

### Testing and CI/CD

-   **Cypress**: Component and End-to-End testing framework for frontend applications.
-   **Jest**: Used in backend services for unit and integration testing.
-   **GitHub Actions**: CI/CD tool used to automate code quality checks, run Cypress tests, and manage workflows for pull requests and pushes.

## Key Features

-   **Monorepo Architecture**: Efficiently manage frontend and backend within a single repository using Lerna.
-   **Comprehensive Testing**: Includes unit, integration, component, and end-to-end tests with Jest and Cypress.
-   **Performance Optimization**: Utilizes Vite for fast builds and Service Workers for PWA capabilities.
-   **Automated Workflows**: GitHub Actions ensure code quality and testing on every pull request.
-   **Seamless Deployment**: Easy deployment process with Nginx and PM2.

## Code Architecture Flow Diagram

![Code Flow](doc/code_flow.png)

## Installation

1. **Install dependencies**:

    ```bash
    npm ci
    ```

2. **Create a `.env` file**: Copy the `.env-example` file to `.env` and update the values with your specific configuration.
    ```bash
    cp .env-example .env
    ```
3. **Run backend migrations**:

    ```bash
    npx lerna run migrate --stream --scope=backend
    ```

4. **Start the development server** (optional, if applicable):
    ```bash
    npx lerna run dev --stream --scope=frontend --scope=backend
    ```

## Development Workflow

-   Start the frontend and backend:
    ```bash
    npx lerna run dev --stream --scope=frontend --scope=backend
    ```
-   Run tests:

    ```bash
    npx lerna run test --stream --scope=backend
    npx lerna run cy:run --stream --scope=frontend -- --component --browser chrome

    # Need to run the app before end to end test
    npx lerna run dev --stream --scope=frontend --scope=backend -- --mode test
    npx lerna run cy:run --stream --scope=frontend -- --e2e --browser chrome
    ```

## Deployment

1. **Build**:

    ```bash
    npx lerna run build --stream --scope=frontend --scope=backend
    ```

2. **Deploy**:

    ```bash
    # Frontend
    pm2 serve FOLDER_NAME PORT --name APP_NAME --spa --time

    # Backend
    pm2 start INITIAL_FILE --name APP_NAME --time
    ```

3. **Nginx** configuration:

    ```nginx
    server {
        listen 443;
        server_name domain.com;

        # SSL configurations
        ssl_certificate      /path_to_ssl_certificate.crt;
        ssl_certificate_key  /path_to_ssl_certificate_key.key;

        # Proxy configurations
        # Backend API
        location /api/ {
            proxy_pass http://localhost:3006/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend
        location / {
            proxy_pass http://localhost:3000/;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

## GitHub Actions Workflow

This repository includes a GitHub Actions workflow for automating code quality checks and running Cypress End-to-End (E2E) tests on pull requests and pushes to the `master` branch.

### Workflow: Code Quality Check and Cypress E2E Test

The workflow is triggered on:

-   Pull requests targeting the `master` branch (on open, synchronize, and reopen events).
-   Push events to the `master` branch.

The workflow includes four jobs:

1. **Code Quality Check**:

    - **Run ESLint**: Runs ESLint to check for code quality issues with `npm run lint`.
    - **Run JSCPD**: Runs JSCPD to detect duplicate code with `npm run check-duplication`. If the duplication check fails, a summary of the results is uploaded to the GitHub summary.

2. **Backend Test**:

    - **MySQL Service**: Sets up a MySQL service for the backend tests.
    - **Backend Setup**: Installs dependencies, sets up the backend environment using environment variables, and runs database migrations.
    - **Jest Test**: Runs Jest tests for the backend.

3. **Cypress Component Test**:

    - **Node.js Setup**: Sets up Node.js (version 20.14.0) for the frontend.
    - **Frontend Setup**: Installs dependencies and sets up the frontend environment using environment variables.
    - **Cypress Component Testing**: Runs Cypress component tests.
    - **Upload Test Artifacts**: If any tests fail, artifacts such as screenshots are uploaded for further investigation.

4. **Cypress E2E Desktop/Mobile**:

    - **MySQL Service**: Sets up a MySQL service for the E2E tests.
    - **Frontend and Backend Setup**: Installs dependencies and sets up both the frontend and backend environments using environment variables. Also runs backend migrations.
    - **Run Services**: Uses `lerna` to start both the frontend and backend services.
    - **Cypress E2E Testing**: Runs Cypress E2E tests against the running frontend and backend services.
    - **Upload Test Artifacts**: If any tests fail, artifacts like screenshots are uploaded for review.

5. **Deployment CD**:

    - **Backend Deployment**:

        - **Environment Setup**: Installs dependencies and configures the backend environment using `.env` variables.
        - **Build and Deploy**: Builds the backend using `npm run build` in the `packages/backend` directory and deploys the built files to the production server using `scp`.

    - **Frontend Deployment**:

        - **Environment Setup**: Installs dependencies and configures the frontend environment using `.env` variables.
        - **Build and Deploy**: Builds the frontend using `npm run build` in the `packages/frontend` directory and deploys the built files to the production server using `scp`.

    - **Selective Deployment**: The workflow is triggered for the `master` branch, deploying only the changed parts (frontend or backend) based on file paths.

This workflow ensures that every code change passes linting, code duplication checks, and comprehensive testing (unit, component, and E2E) before merging into the `master` branch.
