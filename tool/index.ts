import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const MODEL = 'gemma2-9b-it';
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKAGES_DIR = path.join(PROJECT_ROOT, 'packages');
const MAX_FILE_SIZE = 5000;
const MAX_FILES_PER_REQUEST = 2;
const REQUEST_DELAY_MS = 2000; // 2s delay for ~15 RPM
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;
const RATE_LIMIT_PAUSE_MS = 60000; // 60s pause after 429
const TPM_LIMIT = 15000; // Tokens per minute for gemma2-9b-it
const TPD_LIMIT = 500000; // Tokens per day
const TPM_WARNING_THRESHOLD = 5000; // Warn if remaining tokens < 5,000
const USE_FULL_CODEBASE = true; // Toggle to use all codebase files
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

// Priority files (10 files, ~5,000 tokens)
const PRIORITY_FILES = [
    'packages/frontend-react/src/app/components/form/form.tsx',
    'packages/frontend-react/src/app/pages/profile.tsx',
    'packages/frontend-react/src/app/providers/userContext.tsx',
    'packages/services/libraries/api.ts',
    'packages/services/repository/authentication.ts',
    'packages/services/type.d.ts',
    'packages/frontend-react/src/app/components/form/form.types.ts',
    'packages/frontend-react/src/app/components/toast.tsx',
    'packages/frontend-react/src/app/components/dialogView.tsx',
    'packages/services/repository/user.ts',
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
    private generatedFiles: string[] = [];
    private context: Message[] = [];
    private requestCount: number = 0;
    public chunkSent: boolean = false;
    private startTime: number = Date.now();
    private totalTokensUsed: number = 0;

    constructor(
        projectScope: string,
        existingCode: { filePath: string; content: string }[]
    ) {
        this.projectScope = projectScope;
        // Filter to PRIORITY_FILES or use full codebase
        this.existingCode = USE_FULL_CODEBASE
            ? existingCode
            : existingCode
                  .filter((file) => PRIORITY_FILES.includes(file.filePath))
                  .sort(
                      (a, b) =>
                          PRIORITY_FILES.indexOf(a.filePath) -
                          PRIORITY_FILES.indexOf(b.filePath)
                  )
                  .slice(0, 10);
        console.log(
            `Filtered to ${this.existingCode.length} files: ${this.existingCode
                .map((f) => f.filePath)
                .join(', ')}`
        );
        if (!USE_FULL_CODEBASE) {
            const missingFiles = PRIORITY_FILES.filter(
                (file) => !this.existingCode.some((f) => f.filePath === file)
            );
            if (missingFiles.length > 0) {
                console.warn(
                    `Missing PRIORITY_FILES in codebase: ${missingFiles.join(
                        ', '
                    )}`
                );
            }
        }
        this.initializeContext();
        console.log(
            `Initialized with model: ${MODEL}, TPM: ${TPM_LIMIT}, RPM: 30`
        );
    }

    // Initialize system prompt with few-shot examples
    private initializeContext(): void {
        this.context = [
            {
                role: 'system',
                content: `Generate JSON file creation prompts for a TypeScript full-stack app with JWT authentication. Scope: "${this.projectScope}".

Rules:
1. Match style:
   - Frontend: React, TypeScript, Tailwind CSS ('rounded-lg', 'space-y-4', 'bg-gray-100', 'p-4'), use 'FormBuilder' with 'fields' array (name, label, type, value, onChange), 'UserContext' for auth, 'window.showToast' for notifications (e.g., window.showToast('Success', 'success')).
   - Services: TypeScript, use 'Request' from '@services/libraries/api' with axios, 'ILargeRecord' from '@services/type.d' for data types, 'window.showToast' for errors.
   - Use 'dangerouslySetInnerHTML' for form inputs, 'localStorage' for token storage (e.g., localStorage.getItem('token')).
2. Use JWT authentication:
   - Frontend: 'Authorization: Bearer' headers via 'UserContext' with '{ token }'.
   - Services: 'Request' with token headers, handle 401 errors with token refresh.
3. Place files in:
   - 'packages/frontend-react/src/app/pages' for pages.
   - 'packages/frontend-react/cypress/e2e' for tests.
   - 'packages/services/task' for utilities.
4. Use import aliases:
   - '@app/components/form/FormBuilder' for FormBuilder.
   - '@app/components/Toast' for Toast.
   - '@services/libraries/api' for Request.
   - '@services/repository/authentication' for authentication.ts.
   - '@app/providers/userContext' for UserContext.
   - '@services/type.d' for ILargeRecord.
5. Output JSON:
   {
     "fileName": "string",
     "filePurpose": "string",
     "content": "string",
     "directory": "string"
   }
6. Avoid files: ${this.generatedFiles.join(', ')}, TaskPage.tsx, Tasks.tsx.
7. Use 'v1/task/*' endpoints:
   - GET 'v1/task/all'
   - POST 'v1/task/create'
   - PUT 'v1/task/update/:id'
   - DELETE 'v1/task/delete/:id'

Examples:
- Frontend:
\`\`\`tsx
import { useContext, useState, useEffect } from 'react';
import { FormBuilder } from '@app/components/form/FormBuilder';
import { UserContext } from '@app/providers/userContext';
import { Request } from '@services/libraries/api';
import { ILargeRecord } from '@services/type.d';

const Profile = () => {
  const { token } = useContext(UserContext);
  const [name, setName] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Request.put('v1/user/profile', { name }, {
        headers: { Authorization: \`Bearer \${token}\` }
      });
      window.showToast('Profile updated', 'success');
    } catch (error) {
      window.showToast('Update failed', 'error');
    }
  };
  return (
    <div className="rounded-lg space-y-4 p-4 bg-gray-100">
      <FormBuilder
        onSubmit={handleSubmit}
        fields={[{ name: 'name', label: 'Name', type: 'text', value: name, onChange: (e) => setName(e.target.value) }]}
        submitLabel="Save"
      />
    </div>
  );
};
export default Profile;
\`\`\`
- Service:
\`\`\`ts
import { Request } from '@services/libraries/api';
import { ILargeRecord } from '@services/type.d';

export const login = async (email: string, password: string): Promise<ILargeRecord> => {
  try {
    const response = await Request.post('v1/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    window.showToast('Login failed', 'error');
    throw error;
  }
};
\`\`\``,
            },
        ];
    }

    // Delay function
    private async delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // Estimate tokens (~4 chars per token)
    private estimateTokens(content: string): number {
        return Math.ceil(content.length / 4);
    }

    // Update token usage and check limits
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

    // Send codebase chunk with retry logic
    private async sendCodebaseChunk(
        chunk: { filePath: string; content: string }[],
        attempt: number = 1
    ): Promise<void> {
        this.requestCount++;
        const chunkSummary = chunk
            .map(
                ({ filePath, content }) =>
                    `File: ${filePath}\n\`\`\`typescript\n${content}\n\`\`\``
            )
            .join('\n\n');
        const tokens = this.estimateTokens(chunkSummary);
        this.updateTokenUsage(tokens);
        console.log(
            `API Request #${this.requestCount}: Sending chunk (${chunk.length} files, ~${tokens} tokens, Total: ${this.totalTokensUsed})`
        );

        try {
            const response = await axios.post(
                GROQ_API_URL,
                {
                    model: MODEL,
                    messages: [
                        ...this.context,
                        {
                            role: 'user',
                            content: `Codebase chunk:\n${chunkSummary}`,
                        },
                    ],
                    temperature: 0.7,
                    max_completion_tokens: 1000,
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
            console.log(
                `API Request #${this.requestCount}: Chunk sent (Remaining: ${remainingReqs}/30 reqs, ${remainingTokens}/${TPM_LIMIT} tokens)`
            );
            if (remainingTokens < TPM_WARNING_THRESHOLD) {
                console.warn(
                    `Low tokens remaining: ${remainingTokens}/${TPM_LIMIT}. Pausing for ${REQUEST_DELAY_MS}ms.`
                );
                await this.delay(REQUEST_DELAY_MS);
            }
            this.context.push({
                role: 'user',
                content: `Received chunk (${chunk.length} files).`,
            });
        } catch (error: any) {
            if (error.response?.status === 429 && attempt <= MAX_RETRIES) {
                const retryAfter = error.response?.headers['retry-after']
                    ? parseFloat(error.response.headers['retry-after']) * 1000
                    : BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
                console.log(
                    `API Request #${this.requestCount}: 429 Retry Attempt ${attempt}/${MAX_RETRIES}, waiting ${retryAfter}ms`
                );
                await this.delay(retryAfter);
                if (attempt === MAX_RETRIES) {
                    console.log(
                        `Pausing for ${RATE_LIMIT_PAUSE_MS}ms to reset rate limit window`
                    );
                    await this.delay(RATE_LIMIT_PAUSE_MS);
                }
                return this.sendCodebaseChunk(chunk, attempt + 1);
            }
            throw new Error(
                `Failed to send chunk: ${error.message}${error.response ? ` (Status: ${error.response.status}, Details: ${JSON.stringify(error.response.data)})` : ''}`
            );
        }
        await this.delay(REQUEST_DELAY_MS);
    }

    // Call Groq API to generate file prompt
    private async callGroqAPI(
        attempt: number = 1
    ): Promise<FileGenerationPrompt> {
        this.requestCount++;
        const promptContent =
            'Generate the next file prompt for task management in JSON format.';
        const tokens = this.estimateTokens(promptContent);
        this.updateTokenUsage(tokens);
        console.log(
            `API Request #${this.requestCount}: Generating file prompt (~${tokens} tokens, Total: ${this.totalTokensUsed})`
        );

        // Trim context if too large
        const contextTokens = this.estimateTokens(JSON.stringify(this.context));
        if (contextTokens > TPM_LIMIT * 0.8) {
            console.warn(
                `Context size (~${contextTokens} tokens) approaching TPM limit. Trimming older messages.`
            );
            this.context = this.context.slice(-2); // Keep last 2 messages
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
                    temperature: 0.7,
                    max_completion_tokens: 1000,
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
            console.log(
                `API Request #${this.requestCount}: File prompt generated (Remaining: ${remainingReqs}/30 reqs, ${remainingTokens}/${TPM_LIMIT} tokens)`
            );
            if (remainingTokens < TPM_WARNING_THRESHOLD) {
                console.warn(
                    `Low tokens remaining: ${remainingTokens}/${TPM_LIMIT}. Pausing for ${REQUEST_DELAY_MS}ms.`
                );
                await this.delay(REQUEST_DELAY_MS);
            }
            return JSON.parse(
                response.data.choices[0].message.content
            ) as FileGenerationPrompt;
        } catch (error: any) {
            if (error.response?.status === 429 && attempt <= MAX_RETRIES) {
                const retryAfter = error.response?.headers['retry-after']
                    ? parseFloat(error.response.headers['retry-after']) * 1000
                    : BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
                console.log(
                    `API Request #${this.requestCount}: 429 Retry Attempt ${attempt}/${MAX_RETRIES}, waiting ${retryAfter}ms`
                );
                await this.delay(retryAfter);
                if (attempt === MAX_RETRIES) {
                    console.log(
                        `Pausing for ${RATE_LIMIT_PAUSE_MS}ms to reset rate limit window`
                    );
                    await this.delay(RATE_LIMIT_PAUSE_MS);
                }
                return this.callGroqAPI(attempt + 1);
            }
            // Fallback to parse failed_generation
            if (
                error.response?.status === 400 &&
                error.response?.data?.error?.failed_generation
            ) {
                const content = error.response.data.error.failed_generation;
                try {
                    const jsonMatch = content.match(/{[\s\S]*}/);
                    if (jsonMatch) {
                        const prompt = JSON.parse(
                            jsonMatch[0]
                        ) as FileGenerationPrompt;
                        console.log(
                            `Recovered prompt from failed_generation: ${prompt.fileName}`
                        );
                        return prompt;
                    }
                } catch {
                    console.error(
                        `Failed to parse failed_generation: ${content}`
                    );
                }
            }
            throw new Error(
                `Failed to generate prompt: ${error.message}${error.response ? ` (Status: ${error.response.status}, Details: ${JSON.stringify(error.response.data)})` : ''}`
            );
        }
    }

    // Generate the next file prompt and save the file
    public async generateNextFile(totalChunks: number): Promise<void> {
        try {
            // Send codebase chunks once
            if (!this.chunkSent) {
                console.log(
                    `Sending ${totalChunks} codebase chunks (total files: ${this.existingCode.length})`
                );
                for (
                    let i = 0;
                    i < this.existingCode.length;
                    i += MAX_FILES_PER_REQUEST
                ) {
                    const chunk = this.existingCode.slice(
                        i,
                        i + MAX_FILES_PER_REQUEST
                    );
                    await this.sendCodebaseChunk(chunk);
                    console.log(
                        `Sent ${Math.min(i + MAX_FILES_PER_REQUEST, this.existingCode.length)}/${this.existingCode.length} files`
                    );
                }
                this.chunkSent = true;
            }

            // Generate file prompt
            const prompt = await this.callGroqAPI();

            // Validate prompt
            const fullPath = path.join(
                PROJECT_ROOT,
                prompt.directory,
                prompt.fileName
            );
            const relativePath = path.join(prompt.directory, prompt.fileName);
            if (
                this.generatedFiles.includes(relativePath) ||
                this.existingCode.some((file) => file.filePath === relativePath)
            ) {
                console.log(
                    `Skipped: File ${relativePath} already exists or generated`
                );
                return;
            }

            // Save the file
            await fs.mkdir(path.join(PROJECT_ROOT, prompt.directory), {
                recursive: true,
            });
            await fs.writeFile(fullPath, prompt.content);
            console.log(
                `Generated file: ${relativePath} (${(Date.now() - this.startTime) / 1000}s elapsed)`
            );

            // Update generated files and context
            this.generatedFiles.push(relativePath);
            this.context.push({
                role: 'user',
                content: `Generated file: ${relativePath}. Generate the next file prompt.`,
            });
        } catch (error) {
            console.error(`Error generating file: ${(error as Error).message}`);
        }
    }
}

// Utility to read existing codebase
async function readCodebase(): Promise<
    { filePath: string; content: string }[]
> {
    const files: { filePath: string; content: string }[] = [];
    const packageDirs = ['backend', 'frontend-react', 'services']; // Removed 'backend'

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
                            entry.name.endsWith('.tsx')) &&
                        !IGNORED_FILES.includes(entry.name)
                    ) {
                        const content = await fs.readFile(fullPath, 'utf-8');
                        if (content.length < MAX_FILE_SIZE) {
                            files.push({ filePath: relative, content });
                        }
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

// Main function
async function main() {
    const projectScope = `
    Add task management functionality to the existing full-stack application.
    Include CRUD operations for tasks, with tasks linked to authenticated users.
    The frontend uses React with TypeScript and Tailwind CSS, and services use TypeScript with Axios-based 'Request'.
    All task API calls should be protected by JWT authentication using 'Authorization: Bearer' headers.
    Place frontend files in 'packages/frontend-react/src/app/pages' or 'cypress/e2e', and shared utilities in 'packages/services/task'.
    Use existing conventions: 'FormBuilder' for forms, 'window.showToast' for notifications, 'Request' from '@services/libraries/api', 'ILargeRecord' for types, 'dangerouslySetInnerHTML' and 'localStorage' as in existing code.
    Match service files to 'authentication.ts' and frontend pages to 'profile.tsx'.
    Assume task API endpoints exist at 'v1/task/*' (e.g., 'v1/task/create', 'v1/task/all', 'v1/task/update/:id', 'v1/task/delete/:id').
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
    // const totalChunks = Math.ceil(
    //     generator.existingCode.length / MAX_FILES_PER_REQUEST
    // );
    // for (let i = 0; i < 5; i++) {
    //     console.log(
    //         `Generating file ${i + 1}/5 (Estimated requests: ${generator.chunkSent ? 1 : totalChunks + 1})`
    //     );
    //     await generator.generateNextFile(totalChunks);
    // }
}

main().catch((error) => console.error(`Main error: ${error.message}`));
