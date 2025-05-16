import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions ';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKAGES_DIR = path.join(PROJECT_ROOT, 'packages');

interface FileToGenerate {
    fileName: string;
    filePurpose: string;
    directory: string;
    content: string;
}

interface CodebaseFile {
    filePath: string;
    content: string;
}

class AIPromptGenerator {
    private projectScope: string;
    private existingCode: CodebaseFile[];
    public filesToGenerate: FileToGenerate[] = [];
    public generatedFiles: FileToGenerate[] = [];
    private context: { role: string; content: string }[];

    constructor(projectScope: string, existingCode: CodebaseFile[]) {
        this.projectScope = projectScope;
        this.existingCode = existingCode;

        // Build system prompt using existing code paths
        const codePaths = this.existingCode.map((f) => f.filePath).join('\n');

        this.context = [
            {
                role: 'system',
                content: `
You are a full-stack developer working on a modular app platform.
The base layer includes:
- Node.js + Express.js + MySQL
- React + TypeScript + Tailwind CSS
- Modular structure with controllers, services, repositories
- JWT-based authentication
- Shared libraries for database, validation, request handling
- Centralized constants, error handling, routing

Project Scope:
"${this.projectScope}"

Existing Code Paths:
${codePaths}

Instructions:
1. Generate necessary backend and frontend files based on the scope
2. Match naming conventions and folder structure exactly
3. Use FormComponents, DialogView, Table, Filter where appropriate
4. Follow Tailwind classes used in existing components
5. Return only valid JSON — no extra text or explanation
6. Output using format:

{
  "fileName": "string",
  "filePurpose": "string",
  "content": "string (valid, complete code)",
  "directory": "string"
}
`,
            },
        ];
    }

    /**
     * Generates list of required files
     */
    public async generateFileList(): Promise<void> {
        const prompt = `
Analyze the project scope and existing codebase.

Return a JSON array of new files that must be created to fulfill the project requirements.

Each file object must include:
{
  "fileName": "string",
  "filePurpose": "string",
  "directory": "string"
}

Example output:
[
  {
    "fileName": "budgetValidation.ts",
    "filePurpose": "Validate budget input data",
    "directory": "packages/backend/src/validations"
  },
  {
    "fileName": "BudgetPage.tsx",
    "filePurpose": "Display and manage budgets",
    "directory": "packages/frontend-react/src/app/pages/budget"
  }
]
`;

        try {
            const response = await axios.post(
                GROQ_API_URL,
                {
                    model: MODEL,
                    messages: [
                        ...this.context,
                        {
                            role: 'user',
                            content: `Respond in JSON format:\n${prompt}`,
                        },
                    ],
                    temperature: 0.2,
                    max_tokens: 2048,
                    response_format: { type: 'json_object' },
                },
                {
                    headers: {
                        Authorization: `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const raw = response.data.choices[0].message.content;
            const cleanRaw = raw.replace(/```json\n?|```$/g, '').trim();
            this.filesToGenerate = JSON.parse(cleanRaw).files;
        } catch (error: any) {
            try {
                const data = error?.response?.data?.error;
                if (data.failed_generation) {
                    this.filesToGenerate = JSON.parse(
                        `[${data.failed_generation}]`
                    );

                    return;
                }
            } catch {
                //
            }
            console.error(
                '❌ Error generating file list:',
                error.message,
                error?.response?.data?.error
            );
            throw error;
        } finally {
            console.log(`📄 Generated ${this.filesToGenerate.length} files`);
        }
    }

    /**
     * Select relevant reference files for style matching
     */
    private selectReferenceFiles(file: FileToGenerate): CodebaseFile[] {
        const keywords = [
            file.directory.split('/').pop() || '',
            file.fileName.replace(/\..+/, ''),
        ];

        return this.existingCode.filter((f) =>
            keywords.some((kw) =>
                f.filePath.toLowerCase().includes(kw.toLowerCase())
            )
        );
    }

    /**
     * Generate content for one file
     */
    public async generateNextFile(): Promise<FileToGenerate | null> {
        if (this.filesToGenerate.length === 0) return null;

        const file = this.filesToGenerate.shift()!;
        const relativePath = path.join(file.directory, file.fileName);

        console.log(`🧠 Generating file: ${relativePath}`);

        const references = this.selectReferenceFiles(file);
        if (references.length === 0) {
            console.warn(`⚠️ No reference files found for ${relativePath}`);
            return null;
        }

        const referenceContent = references
            .map(
                (ref) =>
                    `Reference File: ${ref.filePath}\n\`\`\`typescript\n${ref.content.slice(0, 300)}...\n\`\`\``
            )
            .join('\n');

        const prompt = `
Generate the file content for:
{
  "fileName": "${file.fileName}",
  "filePurpose": "${file.filePurpose}",
  "directory": "${file.directory}"
}

Use the following reference files to match coding style, imports, and patterns:
${referenceContent}

Ensure:
- Import paths are correct
- Matches existing architecture
- Includes proper types and error handling
- Is ready to use without modification

Output using format:

{
  "fileName": "string",
  "filePurpose": "string",
  "content": "string (valid, complete code)",
  "directory": "string"
}
`;

        try {
            const response = await axios.post(
                GROQ_API_URL,
                {
                    model: MODEL,
                    messages: [
                        ...this.context,
                        { role: 'user', content: prompt },
                    ],
                    temperature: 0.2,
                    max_tokens: 4096,
                },
                {
                    headers: {
                        Authorization: `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const raw = response.data.choices[0].message.content;
            const cleanRaw = raw.replace(/```json\n?|```$/g, '').trim();
            const generatedFile = JSON.parse(cleanRaw) as FileToGenerate;

            // Validate result
            if (
                generatedFile.fileName !== file.fileName ||
                generatedFile.directory !== file.directory
            ) {
                console.warn(
                    `⚠️ Generated file (${generatedFile.fileName}) does not match requested file (${file.fileName})`
                );
                return null;
            }

            this.generatedFiles.push(generatedFile);
            return generatedFile;
        } catch (error: any) {
            console.error(
                `❌ Failed to generate file ${relativePath}:`,
                error.message,
                error?.response?.data?.error
            );
            return null;
        }
    }
}

/**
 * Read codebase files for context
 */
async function readCodebase(): Promise<CodebaseFile[]> {
    const files: CodebaseFile[] = [];

    async function walk(dir: string, relativePath: string = '') {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = relativePath
                ? path.join(relativePath, entry.name)
                : entry.name;

            if (entry.isDirectory()) {
                if (!['node_modules', 'dist', 'build'].includes(entry.name)) {
                    await walk(fullPath, relPath);
                }
            } else if (
                entry.name.endsWith('.ts') ||
                entry.name.endsWith('.tsx')
            ) {
                try {
                    const content = await fs.readFile(fullPath, 'utf-8');
                    files.push({ filePath: relPath, content });
                } catch (err: any) {
                    console.warn(`⚠️ Error reading ${relPath}:`, err.message);
                }
            }
        }
    }

    await walk(PACKAGES_DIR);
    return files;
}

/**
 * Main execution
 */
async function main() {
    const featureDescription = process.argv.slice(2).join(' ');

    if (!featureDescription) {
        console.error('Please provide a feature description.');
        console.info('Example:');
        console.info(
            'npx ts-node ai-code-generator.ts "Add recurring expenses module"'
        );
        process.exit(1);
    }

    console.log('🧠 Reading codebase...');
    const existingCode = await readCodebase();

    console.log('🧠 Initializing generator...', existingCode);
    const generator = new AIPromptGenerator(featureDescription, existingCode);

    console.log('📄 Generating file list...');
    await generator.generateFileList();

    console.log('⚙️ Generating files...', generator.filesToGenerate);
    while (generator.filesToGenerate.length > 0) {
        const result = await generator.generateNextFile();
        if (result) {
            const fullPath = path.join(
                PACKAGES_DIR,
                result.directory,
                result.fileName
            );
            const dir = path.dirname(fullPath);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(fullPath, result.content.trim());
            console.log(`✅ Wrote: ${fullPath}`);
        }
    }

    console.log('🎉 Done!');
}

main().catch(console.error);
