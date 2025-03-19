import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import FormDemo from './formDemo?raw';

export const CodeBlock = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Truncate code to first 5 lines for collapsed view (adjust as needed)
    const truncatedCode = FormDemo.split('\n').slice(0, 5).join('\n');
    const displayCode = isExpanded ? FormDemo : truncatedCode;

    const handleCopy = () => {
        navigator.clipboard.writeText(FormDemo).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        });
    };

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="w-full rounded-xl p-3 bg-neutral-800 max-w-screen-md mx-auto no-scrollbar relative">
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 px-2 py-1 text-sm text-white bg-neutral-700 hover:bg-neutral-600 rounded-md transition"
                title={isCopied ? 'Copied!' : 'Copy to clipboard'}
            >
                {isCopied ? 'Copied!' : 'Copy'}
            </button>

            <SyntaxHighlighter
                language="tsx"
                style={darcula}
                customStyle={{
                    margin: 0,
                    padding: '1rem',
                    background: 'transparent',
                    maxHeight: isExpanded ? 'none' : '200px',
                    overflow: 'hidden',
                }}
            >
                {displayCode}
            </SyntaxHighlighter>

            {FormDemo.split('\n').length > 5 && (
                <button
                    onClick={handleToggle}
                    className="mt-2 text-sm text-neutral-300 hover:text-white underline"
                >
                    {isExpanded ? 'Collapse' : 'Expand'}
                </button>
            )}
        </div>
    );
};
