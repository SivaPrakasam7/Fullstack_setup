import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKAGES_DIR = path.join(PROJECT_ROOT, 'packages');
const REQUEST_DELAY_MS = 2000;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;
const RATE_LIMIT_PAUSE_MS = 60000;
const TPM_LIMIT = 6000;
const TPD_LIMIT = Infinity;
const TPM_WARNING_THRESHOLD = 2000;
const IGNORED_FOLDERS = [
    'node_modules',
    'dist',
    'build',
    'out',
    'coverage',
    'backups',
    'logs',
    '.git',
    '__tests__',
    'cypress',
];
const IGNORED_FILES = [
    'package.json',
    'package-lock.json',
    '.env',
    '.gitignore',
    'tsconfig.json',
    'jest.config.js',
    '.env.production',
    '.env.test-git',
    'vite.config.ts',
    'cypress.config.ts',
];

// Interfaces
interface Message {
    role: 'system' | 'user';
    content: string;
}

interface FileGenerationPrompt {
    fileName: string;
    filePurpose: string;
    content: string;
    directory: string;
}

interface FileToGenerate {
    fileName: string;
    filePurpose: string;
    directory: string;
}

interface GroqResponse {
    choices: Array<{
        message: { content: string };
    }>;
    headers?: { [key: string]: string };
}

// AI Prompt Generator Class
class AIPromptGenerator {
    private projectScope: string;
    public existingCode: { filePath: string; content: string }[];
    public generatedFiles: string[] = [];
    private context: Message[] = [];
    private requestCount: number = 0;
    private startTime: number = Date.now();
    private totalTokensUsed: number = 0;
    public filesToGenerate: FileToGenerate[] = [];

    constructor(
        projectScope: string,
        existingCode: { filePath: string; content: string }[]
    ) {
        this.projectScope = projectScope;
        this.existingCode = existingCode;
        console.log(
            `Initialized with ${this.existingCode.length} files: ${this.existingCode
                .map((f) => f.filePath)
                .join(', ')}`
        );
        this.initializeContext();
        console.log(
            `Initialized with model: ${MODEL}, TPM: ${TPM_LIMIT}, RPM: 30`
        );
    }

    private initializeContext(): void {
        const codebaseFilePaths = this.existingCode
            .map((f) => f.filePath)
            .join('\n');
        this.context = [
            {
                role: 'system',
                content: `You are a skilled full-stack developer tasked with generating files for a TypeScript-based application. Your goal is to create files that seamlessly integrate with the existing codebase, matching its style, conventions, and architecture, based on the provided project scope.
              
              Project Scope:
              "${this.projectScope}"
              
              Existing Codebase Files:
              ${codebaseFilePaths}
              
              Instructions:
              1. **Analyze the Project Scope and Codebase**:
                 - Understand the required functionality based on the project scope.
                 - Analyze the existing file structure to determine proper directory placement.
                 - Do **not** generate files that already exist or have been previously generated: ${this.generatedFiles.join(', ')}.
              
              2. **Generate a File List**:
                 - Return a JSON array of new files required to implement the feature.
                 - Each file object must contain:
                   {
                     "fileName": "string",
                     "filePurpose": "string (brief description of the file’s role)",
                     "directory": "string (relative path, e.g., 'packages/frontend-react/src/app/pages')"
                   }
                 - Ensure each file is relevant, necessary, and unique within its directory.
              
              3. **Generate File Content**:
                 - For each file, generate complete TypeScript code that aligns with the existing codebase in naming, structure, and conventions.
                 - Match import styles, dependency usage, and architecture.
                 - Ensure code is type-safe, includes error handling, and is production-ready.
              
              4. **Reference Existing Code**:
                 - For each new file, use 1–2 similar files from the same directory or functional purpose to guide structure and style.
                 - Ensure you replicate patterns (e.g., middleware, API handlers, or React components) accurately.
              
              5. **Output Format**:
                 - When generating content for each file, use this structure:
                   {
                     "fileName": "string",
                     "filePurpose": "string",
                     "content": "string (valid, complete code)",
                     "directory": "string"
                   }
              
              6. **Coding Standards**:
                 - Maintain consistency with the existing codebase in naming, organization, and formatting.
                 - Use appropriate tech stacks: React with TypeScript for frontend, Express with TypeScript for backend.
                 - Respect architectural boundaries and conventions (e.g., controller, service, route layers).
              
              Notes:
              - For frontend additions, follow existing component and page patterns.
              - For backend features, align with current routing, controller, service, and validation modules.
              - Do not duplicate logic or files. Only create files truly needed to implement the scoped functionality.`,
            },
        ];
    }

    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private estimateTokens(content: string): number {
        return Math.ceil(content.length / 4);
    }

    private updateTokenUsage(tokens: number): void {
        this.totalTokensUsed += tokens;
        if (this.totalTokensUsed > TPD_LIMIT * 0.9 && TPD_LIMIT !== Infinity) {
            console.warn(
                `Approaching daily token limit: ${this.totalTokensUsed}/${TPD_LIMIT} tokens used`
            );
        }
        if (tokens > TPM_LIMIT * 0.8) {
            console.warn(
                `High token usage in single request: ${tokens}/${TPM_LIMIT} tokens`
            );
        }
    }

    private selectReferenceFiles(
        file: FileToGenerate
    ): { filePath: string; content: string }[] {
        const sameDirectory = this.existingCode.filter((f) =>
            f.filePath.startsWith(file.directory)
        );
        const references = sameDirectory
            .filter(
                (f, index, self) =>
                    self.findIndex((x) => x.filePath === f.filePath) === index
            )
            .slice(0, 2);
        return references;
    }

    private async callGroqAPI(
        promptContent: string,
        attempt: number = 1
    ): Promise<any> {
        const requestId = `${this.requestCount + 1}-${Date.now()}`;
        const startTime = Date.now();
        this.requestCount++;
        const tokens = this.estimateTokens(promptContent);
        this.updateTokenUsage(tokens);

        console.log(`=== Request #${requestId} ===`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log(`Prompt:\n${promptContent}`);
        console.log(`Estimated Tokens: ${tokens}`);
        console.log(`Total Tokens Used: ${this.totalTokensUsed}`);

        const contextTokens = this.estimateTokens(JSON.stringify(this.context));
        if (contextTokens > TPM_LIMIT * 0.8) {
            console.warn(
                `Context size (~${contextTokens} tokens) approaching TPM limit. Trimming older messages.`
            );
            this.context = this.context.slice(-2);
        }

        try {
            const response = await axios.post<GroqResponse>(
                GROQ_API_URL,
                {
                    model: MODEL,
                    messages: [
                        ...this.context,
                        { role: 'user', content: promptContent },
                    ],
                    temperature: 0.5,
                    max_completion_tokens: 8192,
                    response_format: { type: 'json_object' },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${GROQ_API_KEY}`,
                    },
                }
            );
            const remainingReqs = parseInt(
                response.headers['x-ratelimit-remaining-requests'] || '30'
            );
            const remainingTokens = parseInt(
                response.headers['x-ratelimit-remaining-tokens'] ||
                    TPM_LIMIT.toString()
            );
            const parsedResponse = JSON.parse(
                response.data.choices[0].message.content
            );
            const duration = (Date.now() - startTime) / 1000;

            console.log(`=== Response #${requestId} ===`);
            console.log(`Timestamp: ${new Date().toISOString()}`);
            console.log(
                `Response:\n${JSON.stringify(parsedResponse, null, 2)}`
            );
            console.log(`Remaining Requests: ${remainingReqs}/30`);
            console.log(`Remaining Tokens: ${remainingTokens}/${TPM_LIMIT}`);
            console.log(`Duration: ${duration}s`);
            console.log(`====================`);

            if (remainingTokens < TPM_WARNING_THRESHOLD) {
                console.warn(
                    `Low tokens remaining: ${remainingTokens}/${TPM_LIMIT}. Pausing for ${REQUEST_DELAY_MS}ms.`
                );
                await this.delay(REQUEST_DELAY_MS);
            }
            return parsedResponse;
        } catch (error: any) {
            const duration = (Date.now() - startTime) / 1000;
            console.error(`=== Error #${requestId} ===`);
            console.error(`Timestamp: ${new Date().toISOString()}`);
            console.error(`Prompt:\n${promptContent}`);
            console.error(`Error: ${error.message}`);
            if (error.response) {
                console.error(`Status: ${error.response.status}`);
                console.error(
                    `Details: ${JSON.stringify(error.response.data, null, 2)}`
                );
            }
            console.error(`Duration: ${duration}s`);
            console.error(`====================`);

            if (error.response?.status === 429 && attempt <= MAX_RETRIES) {
                const retryAfter = error.response?.headers['retry-after']
                    ? parseFloat(error.response.headers['retry-after']) * 1000
                    : BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
                console.log(
                    `Retry Attempt ${attempt}/${MAX_RETRIES}, waiting ${retryAfter}ms`
                );
                await this.delay(retryAfter);
                if (attempt === MAX_RETRIES) {
                    console.log(
                        `Pausing for ${RATE_LIMIT_PAUSE_MS}ms to reset rate limit window`
                    );
                    await this.delay(RATE_LIMIT_PAUSE_MS);
                }
                return this.callGroqAPI(promptContent, attempt + 1);
            }
            if (
                error.response?.status === 400 &&
                error.response?.data?.error?.failed_generation
            ) {
                const content = error.response.data.error.failed_generation;
                console.warn(
                    `JSON validation failed. Attempting to recover from: ${content}`
                );
                try {
                    const fixedContent = `[${content.trim().replace(/,\s*$/, '')}]`;
                    const parsed = JSON.parse(fixedContent);
                    console.log(
                        `Recovered JSON from failed_generation: ${JSON.stringify(parsed, null, 2)}`
                    );
                    return { files: parsed };
                } catch (parseError) {
                    console.error(
                        `Failed to parse failed_generation: ${content}. Error: ${(parseError as Error).message}`
                    );
                }
            }
            throw error;
        }
    }

    public async generateFileList(): Promise<void> {
        if (this.filesToGenerate.length > 0) {
            console.log('File list already generated. Skipping.');
            return;
        }
        const promptContent = `Analyze the project scope and existing codebase. Return a valid JSON array of new files that must be created to fulfill the project requirements.

Instructions:
- The output must be a **properly formatted JSON array**, enclosed in square brackets.
- **Do not include trailing commas**.
- Each file object must include the following fields:
  - "fileName": a unique file name within its directory that matches the project's naming conventions (e.g., lowerCamelCase or kebab-case as found in existing files).
  - "filePurpose": a concise description of the file’s role in fulfilling the project scope.
  - "directory": a valid existing or conventionally inferred path (e.g., 'packages/frontend-react/src/app/pages', 'packages/backend/src/routes', 'packages/services/repository').

Constraints:
- Only suggest files that are necessary to implement the described feature.
- Match the style, file structure, and naming conventions found in the current codebase.
- Avoid suggesting files that already exist or duplicate functionality.
- Suggested file paths must align with the existing folder structure.

Example output:
[
  {
    "fileName": "blog.ts",
    "filePurpose": "Handles database operations for blog posts",
    "directory": "packages/backend/src/repository"
  },
  {
    "fileName": "create.tsx",
    "filePurpose": "React component for creating blog posts",
    "directory": "packages/frontend-react/src/app/pages/blog"
  }
]`;
        console.log('Generating file list...');
        try {
            this.filesToGenerate = (
                (await this.callGroqAPI(promptContent)) as {
                    files: FileToGenerate[];
                }
            ).files;
            console.log(
                `Generated ${this.filesToGenerate.length} files to create: ${this.filesToGenerate
                    .map((f) => `${f.directory}/${f.fileName}`)
                    .join(', ')}`
            );
        } catch (error) {
            console.error(
                `Failed to generate file list: ${(error as Error).message}`
            );
            throw error;
        }
    }

    public async generateNextFile(): Promise<void> {
        if (this.filesToGenerate.length === 0) {
            console.log('No files left to generate.');
            return;
        }

        const file = this.filesToGenerate.shift()!;
        const relativePath = path.join(file.directory, file.fileName);
        console.log(`Generating file: ${relativePath}`);
        try {
            const references = this.selectReferenceFiles(file);
            if (references.length === 0) {
                console.warn(
                    `No reference files found for ${relativePath}. Skipping generation.`
                );
                return;
            }
            const referenceContent = references
                .map(
                    (ref) =>
                        `Reference File: ${ref.filePath}\n\`\`\`typescript\n${ref.content}\n\`\`\``
                )
                .join('\n\n');
            const promptContent = `Generate the file content for:
{
  "fileName": "${file.fileName}",
  "filePurpose": "${file.filePurpose}",
  "directory": "${file.directory}"
}
Use the following reference code to match style and conventions:\n${referenceContent}
Return a valid JSON object with no trailing commas, following the format:
{
  "fileName": "${file.fileName}",
  "filePurpose": "${file.filePurpose}",
  "content": "string (complete, error-free code)",
  "directory": "${file.directory}"
}`;
            const prompt = (await this.callGroqAPI(
                promptContent
            )) as FileGenerationPrompt;

            if (
                prompt.fileName !== file.fileName ||
                prompt.directory !== file.directory
            ) {
                console.warn(
                    `Generated file (${prompt.fileName}) does not match requested file (${file.fileName})`
                );
                return;
            }

            const fullPath = path.join(
                PROJECT_ROOT,
                prompt.directory,
                prompt.fileName
            );
            await fs.mkdir(path.join(PROJECT_ROOT, prompt.directory), {
                recursive: true,
            });
            await fs.writeFile(fullPath, prompt.content);
            console.log(
                `Successfully generated file: ${relativePath} (${(Date.now() - this.startTime) / 1000}s elapsed)`
            );

            this.generatedFiles.push(relativePath);
            this.context.push({
                role: 'user',
                content: `Generated file: ${relativePath}.`,
            });
        } catch (error) {
            console.error(
                `Failed to generate file ${relativePath}: ${(error as Error).message}`
            );
        }
    }
}

// readCodebase function
async function readCodebase(): Promise<
    { filePath: string; content: string }[]
> {
    const files: { filePath: string; content: string }[] = [];
    const packageDirs = ['backend', 'frontend-react', 'services'];

    for (const pkg of packageDirs) {
        const pkgDir = path.join(PACKAGES_DIR, pkg);
        try {
            const readDir = async (
                dir: string,
                relativePath: string = `packages/${pkg}`
            ) => {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    const relative = path.join(relativePath, entry.name);
                    if (entry.isDirectory()) {
                        if (!IGNORED_FOLDERS.includes(entry.name)) {
                            await readDir(fullPath, relative);
                        }
                    } else if (
                        (entry.name.endsWith('.ts') ||
                            entry.name.endsWith('.tsx') ||
                            entry.name.endsWith('.sql')) &&
                        !IGNORED_FILES.includes(entry.name)
                    ) {
                        const content = await fs.readFile(fullPath, 'utf-8');
                        files.push({ filePath: relative, content });
                    }
                }
            };
            await readDir(pkgDir);
        } catch (error) {
            console.warn(`Failed to read directory ${pkgDir}: ${error}`);
        }
    }
    console.log(`Loaded ${files.length} codebase files`);
    return files;
}

// main function
async function main() {
    const projectScope = `
    Add blogging functionality to the existing full-stack application.
    Include CRUD operations for blog posts, with posts linked to authenticated users.
    `;

    const existingCode = await readCodebase();
    const outputPath = path.join(PROJECT_ROOT, 'tool', 'codebase.json');
    try {
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, JSON.stringify(existingCode, null, 2));
        console.log(`Codebase saved to ${outputPath}`);
    } catch (error) {
        console.error(
            `Failed to save codebase JSON: ${(error as Error).message}`
        );
    }
    // const generator = new AIPromptGenerator(projectScope, existingCode);
    // await generator.generateFileList();
    // while (generator.filesToGenerate.length > 0) {
    //     console.log(
    //         `Generating file ${generator.generatedFiles.length + 1}/${generator.generatedFiles.length + generator.filesToGenerate.length}`
    //     );
    //     await generator.generateNextFile();
    // }
}

main().catch((error) => console.error(`Main error: ${error.message}`));
