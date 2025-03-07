/* eslint-disable @typescript-eslint/no-require-imports */
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const databaseName = process.env.DATABASE_NAME;
const logDatabaseName = process.env.LOG_DATABASE_NAME;
const keyDatabaseName = process.env.KEY_DATABASE_NAME;

// MySQL connection setup
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
});

// Function to ensure database exists
const ensureDatabaseExists = (databaseName) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`,
            (err) => {
                if (err) return reject(err);
                console.log(`Database ${databaseName} ensured to exist.`);
                connection.query(
                    `CREATE DATABASE IF NOT EXISTS \`${logDatabaseName}\`;`,
                    (err) => {
                        if (err) return reject(err);
                        console.log(
                            `Database ${logDatabaseName} ensured to exist.`
                        );
                        connection.query(
                            `CREATE DATABASE IF NOT EXISTS \`${keyDatabaseName}\`;`,
                            (err) => {
                                if (err) return reject(err);
                                console.log(
                                    `Database ${keyDatabaseName} ensured to exist.`
                                );
                                resolve();
                            }
                        );
                    }
                );
            }
        );
    });
};

// Function to switch to the correct database
const switchDatabase = (databaseName) => {
    return new Promise((resolve, reject) => {
        connection.changeUser({ database: databaseName }, (err) => {
            if (err) return reject(err);
            console.log(`Switched to database ${databaseName}.`);
            resolve();
        });
    });
};

// Function to ensure migrations table exists
const ensureMigrationsTableExists = () => {
    return new Promise((resolve, reject) => {
        const createTableQuery = `
			CREATE TABLE IF NOT EXISTS migrations (
				id INT NOT NULL AUTO_INCREMENT,
				migration VARCHAR(255) NOT NULL,
				applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
				PRIMARY KEY (id)
			);
		`;
        connection.query(createTableQuery, (err) => {
            if (err) return reject(err);
            console.log('Migrations table ensured to exist.');
            resolve();
        });
    });
};

// Function to get all applied migrations
const getAppliedMigrations = () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT migration FROM migrations', (err, results) => {
            if (err) reject(err);
            resolve(results.map((row) => row.migration));
        });
    });
};

// Function to apply a migration
const applyMigration = (migrationFile) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, 'migrations', migrationFile);
        const sql = fs.readFileSync(filePath, 'utf8');

        connection.query(sql, (err) => {
            if (err) return reject(err);

            connection.query(
                `use ${databaseName}; INSERT INTO migrations (migration) VALUES (?)`,
                [migrationFile],
                (err) => {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
    });
};

// Function to create a database backup
const createDatabaseBackup = () => {
    return new Promise((resolve, reject) => {
        const backupFilePath = path.join(
            __dirname,
            'backups',
            `backup_${new Date()
                .toLocaleString()
                .replaceAll(/(\s|-|\/)/g, '_')
                .replaceAll(',', '')}.sql`
        );

        const dumpCommand = `mysqldump --host=${process.env.DB_HOST} --user=${process.env.DB_USER} --password=${process.env.DB_PASSWORD} ${databaseName} --ignore-table=${databaseName}.logs > ${backupFilePath}`;

        exec(dumpCommand, (error) => {
            if (error) {
                console.error(`Error creating backup: ${error.message}`);
                return reject(error);
            }
            console.log(`Database backup created at: ${backupFilePath}`);
            resolve();
        });
    });
};

// Main function to run migrations
const runMigrations = async () => {
    try {
        // Ensure the database exists
        await ensureDatabaseExists(databaseName);

        // Switch to the correct database
        await switchDatabase(databaseName);

        // Ensure the migrations table exists
        await ensureMigrationsTableExists();

        // Create a backup before running migrations
        await createDatabaseBackup();

        // Get applied migrations
        const appliedMigrations = await getAppliedMigrations();

        // Read migration files from the directory
        const migrationFiles = fs.readdirSync(
            path.join(__dirname, 'migrations')
        );

        // Filter out migrations that haven't been applied yet
        const newMigrations = migrationFiles.filter(
            (file) =>
                file === 'procedures.sql' || !appliedMigrations.includes(file)
        );

        // Apply new migrations
        for (const migrationFile of newMigrations) {
            console.log(`Applying migration: ${migrationFile}`);
            await applyMigration(migrationFile);
            console.log(`Migration ${migrationFile} applied successfully`);
        }

        console.log('All migrations applied.');
    } catch (err) {
        console.error('Error running migrations:', err);
    } finally {
        connection.end();
    }
};

// Ensure the backups folder exists
if (!fs.existsSync(path.join(__dirname, 'backups'))) {
    fs.mkdirSync(path.join(__dirname, 'backups'));
}

// Run the migrations
runMigrations();
