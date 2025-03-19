import { CodeBlock } from './demos/codeBlock';
import { FormDemo } from './demos/formDemo';

export default () => {
    return (
        <div className="max-w-screen-md w-full mx-auto px-4 py-8 flex flex-col gap-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                Components Showcase
            </h1>

            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Code Block
                </h2>
                <CodeBlock />
            </section>

            <section className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                    Form Demo
                </h2>
                <FormDemo />
            </section>
        </div>
    );
};
