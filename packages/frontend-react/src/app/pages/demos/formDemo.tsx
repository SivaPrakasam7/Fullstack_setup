import { useState } from 'react';
import { IFormField } from 'src/app/components/form/form.types';
import { FormBuilder } from 'src/app/components/form/main';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

//
const form = {
    label: {
        label: 'Only label',
        type: 'label',
        required: true,
    },
    text: {
        label: 'Textfield',
        type: 'text',
        placeHolder: 'Enter some input',
        required: true,
        requiredLabel: 'Textfield is required',
    },
    number: {
        label: 'Number field',
        type: 'number',
        placeHolder: '1234567890',
        required: true,
        requiredLabel: 'Number field is required',
    },
    textarea: {
        label: 'Textarea field',
        type: 'textarea',
        placeHolder:
            'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Error quaerat soluta eum nulla fugiat fuga mollitia nisi recusandae voluptates! Nulla!',
        multiple: true,
        rows: 4,
        required: true,
        requiredLabel: 'Textarea field is required',
    },
    date: {
        label: 'Date field',
        type: 'date',
        placeHolder: 'Select date',
        required: true,
        requiredLabel: 'Date field is required',
    },
    time: {
        label: 'Time field',
        type: 'time',
        placeHolder: 'Select time',
        required: true,
        requiredLabel: 'Time field is required',
    },
    datetime: {
        label: 'Date and Time field',
        type: 'datetime-local',
        placeHolder: 'Select date and time',
        required: true,
        requiredLabel: 'Date and Time field is required',
    },
    file: {
        label: 'File field',
        type: 'file',
        placeHolder: 'Select file',
        required: true,
        requiredLabel: 'File field is required',
        size: 'min-h-72 w-72',
        imageSize: 'min-h-72 w-72',
        className: '!w-fit',
        layoutClass: '!grid-cols-1 sm:!grid-cols-2',
        accept: 'image/png,image/jpg,image/jpeg,application/pdf',
    },
    tag: {
        label: 'Tag field',
        type: 'tag',
        placeHolder: 'Enter tags',
        required: true,
        requiredLabel: 'Tag field is required',
    },
    password: {
        label: 'Password field',
        type: 'password',
        placeHolder: 'Enter password',
        required: true,
        requiredLabel: 'Password field is required',
    },
    autocomplete: {
        label: 'Autocomplete field',
        type: 'autocomplete',
        placeHolder: 'Select option',
        required: true,
        requiredLabel: 'Autocomplete field is required',
        options: [
            {
                id: 'option1',
                label: 'Option 1',
            },
            {
                id: 'option2',
                label: 'Option 2',
            },
        ],
    },
    select: {
        label: 'Select field',
        type: 'select',
        placeHolder: 'Select option',
        required: true,
        requiredLabel: 'Select field is required',
        options: [
            {
                id: 'option1',
                label: 'Option 1',
            },
            {
                id: 'option2',
                label: 'Option 2',
            },
        ],
    },
    otp: {
        label: 'OTP field',
        type: 'otp',
        placeHolder: '0',
        required: true,
        requiredLabel: 'OTP field is required',
    },
    checkBox: {
        label: 'Checkbox field',
        type: 'checkbox',
        options: [{ id: 'true', label: 'I agree this site is cool' }],
        required: true,
        requiredLabel: 'Checkbox field is required',
    },
    radio: {
        label: 'Radio field',
        type: 'radio',
        options: [
            { id: 'option1', label: 'Option 1' },
            { id: 'option2', label: 'Option 2' },
        ],
        required: true,
        requiredLabel: 'Radio field is required',
    },
    custom: {
        type: 'custom',
        element: ({ onFieldChange }) => (
            <div className="flex flex-col gap-1">
                <label>Custom field</label>
                <input
                    className="bg-transparent border rounded-full px-3 py-2 w-full"
                    placeholder="Custom designed field"
                    onChange={(e) => {
                        onFieldChange({
                            name: 'custom',
                            value: e.target.value,
                        });
                    }}
                />
            </div>
        ),
    },
} as Record<string, IFormField>;

export const FormDemo = () => {
    const [payload, setPayload] = useState(null);

    const call = async (payload: ILargeRecord) => {
        setPayload(payload); // Store the payload for display
        return false; // Assuming this controls form submission success/failure
    };

    return (
        <div className="flex flex-col gap-6">
            <FormBuilder
                form={form}
                call={call}
                buttonText="Submit"
                layoutClass="mx-auto max-w-screen-sm w-full gap-5"
                buttonClass="mt-6"
            />
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mt-10">
                Form payload
            </h2>
            <div className="relative rounded-lg bg-neutral-800 overflow-hidden">
                <SyntaxHighlighter
                    language="json"
                    style={darcula}
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'transparent',
                        maxHeight: '300px', // Fixed height for consistency
                        overflowY: 'auto',
                    }}
                >
                    {payload
                        ? JSON.stringify(payload, null, 2)
                        : 'Submit form to see payload'}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};
