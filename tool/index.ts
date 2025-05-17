import { promises as fs } from 'fs';
import * as path from 'path';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const PROJECT_ROOT = path.resolve(__dirname);

interface CodebaseFile {
    filePath: string;
    content: string;
}

interface FileToGenerate {
    fileName: string;
    filePurpose: string;
    content: string;
    directory: string;
}

class AICodeGenerator {
    private groq: Groq;
    private projectScope: string;
    private existingCode: CodebaseFile[] = [];
    private model: string;

    constructor(featureDescription: string) {
        this.projectScope = featureDescription;
        this.model = process.env.MODEL || 'llama3-70b-8192';
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }

    public async init(): Promise<void> {
        const packagesDir = path.resolve(PROJECT_ROOT, '../packages');
        this.existingCode = await this.readCodebase(packagesDir);
    }

    private async readCodebase(dir: string): Promise<CodebaseFile[]> {
        const files: CodebaseFile[] = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                const subFiles = await this.readCodebase(fullPath);
                files.push(...subFiles);
            } else if (
                entry.isFile() &&
                /\.(ts|tsx|sql|md)$/.test(entry.name)
            ) {
                try {
                    const content = await fs.readFile(fullPath, 'utf-8');
                    files.push({ filePath: fullPath, content });
                } catch (err: any) {
                    console.error(`Error reading ${fullPath}:`, err.message);
                }
            }
        }

        return files;
    }

    private getReferenceExamples(): string {
        // Pick 2 example files matching common patterns
        const examples = this.existingCode
            .filter(
                (f) =>
                    f.filePath.includes('controller') ||
                    f.filePath.includes('service')
            )
            .slice(0, 2);

        return examples
            .map((e) => {
                const shortPath = e.filePath.replace(process.cwd(), '');
                return `Example from ${shortPath}:\n\`\`\`ts\n${e.content.slice(0, 400)}\n\`\`\``;
            })
            .join('\n\n');
    }

    public async generateFileList(): Promise<FileToGenerate[]> {
        const prompt = `
You are a senior developer working on a monorepo structured with lerna.
The backend uses Node.js + Express + TypeScript + MySQL.
Frontend is built with React/Vue + Tailwind CSS.

Your task: Implement "${this.projectScope}" by generating all necessary files.

Use the following patterns:
- Backend: controllers, services, routes, models, validators
- Frontend: pages, components, forms
- Shared types/interfaces where applicable

Follow naming conventions and folder structure exactly.

Examples:
${this.getReferenceExamples()}

Return only valid JSON array of files:
[
  {
    "fileName": "blogController.ts",
    "filePurpose": "Handles blog post CRUD operations",
    "directory": "packages/backend/src/controllers",
    "content": "..."
  },
  {
    "fileName": "BlogPage.tsx",
    "filePurpose": "React page component for displaying blog posts",
    "directory": "packages/frontend-react/src/pages/blog",
    "content": "..."
  }
]
`;

        try {
            const chatCompletion = await this.groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: this.model,
                response_format: { type: 'json_object' },
            });

            const response =
                chatCompletion.choices[0]?.message?.content?.trim() || '';
            return JSON.parse(response).files as FileToGenerate[];
        } catch (e: any) {
            if (e.error.error.failed_generation) {
                try {
                    return JSON.parse(`[${e.error.error.failed_generation}]`);
                } catch {
                    return [];
                }
            }
            return [];
        }
    }

    public async generateAndWriteFiles(files: FileToGenerate[]): Promise<void> {
        for (const file of files) {
            const fullPath = path.join(
                PROJECT_ROOT,
                '..',
                file.directory,
                file.fileName
            );
            const dir = path.dirname(fullPath);

            try {
                await fs.mkdir(dir, { recursive: true });
                await fs.writeFile(fullPath, file.content.trim());
                console.log(`✅ Wrote: ${fullPath}`);
            } catch (err: any) {
                console.error(`❌ Failed to write ${fullPath}:`, err.message);
            }
        }
    }
}

async function main() {
    const featureDescription = process.argv.slice(2).join(' ');
    if (!featureDescription) {
        console.log('Usage: npm run ai-gen <feature description>');
        process.exit(1);
    }

    console.log(`🧠 Generating code for: "${featureDescription}"`);

    const generator = new AICodeGenerator(featureDescription);
    await generator.init();

    try {
        const filesToGenerate = await generator.generateFileList();
        console.log(filesToGenerate);
        console.log(`📄 Generated ${filesToGenerate.length} files`);
        // await generator.generateAndWriteFiles(filesToGenerate);
    } catch (error: any) {
        console.error('🚨 Error during generation:', error.message);
    }
}

main();

// npm run start "Add user profile management with avatar upload and settings form"
