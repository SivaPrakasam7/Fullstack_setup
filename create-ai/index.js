/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const API_KEY = process.env.API_KEY;

class ProjectAnalyzer {
    constructor() {
        this.ignoreList = [
            '/node_modules',
            '/.git',
            '.gitignore',
            'package-lock.json',
            '/.husky',
            '/.vscode',
            '/doc',
            '/dist',
            '/out',
            '.env',
            '/create-ai',
        ];
        this.directories = [];
        this.files = [];
        this.dependencies = [];
        this.configs = [];
        this.dataset = [];
    }

    walkDir = async (dir) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (
                    this.ignoreList.some((ignorePath) =>
                        fullPath.includes(ignorePath)
                    )
                ) {
                    console.log(fullPath);
                    continue;
                }

                this.directories.push(fullPath);
                await this.walkDir(fullPath);
            } else if (entry.isFile()) {
                const content = await fs.promises.readFile(fullPath, 'utf-8');
                this.files.push({
                    path: fullPath,
                    content,
                });
                this.dataset.push({
                    prompt: `Generate code for ${entry.name}`,
                    completion: content,
                });
            }
        }
    };

    saveDataset(outPath) {
        const data = this.dataset
            .map((entry) => JSON.stringify(entry))
            .join('\n');
        fs.writeFileSync(outPath, data);
    }
}

const main = async () => {
    const dir = '../';
    const outPath = './dataset.jsonl';
    const analyzer = new ProjectAnalyzer();
    await analyzer.walkDir(dir);
    analyzer.saveDataset(outPath);
    console.log(`Dataset created with ${analyzer.dataset.length} entries.`);
};

main();
