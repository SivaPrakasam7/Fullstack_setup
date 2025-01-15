<template>
    <div
        class="flex flex-col gap-5 items-center justify-center h-screen w-screen"
    >
        <div class="max-w-[400px] w-full flex flex-col gap-2 p-2">
            <p class="text-4xl font-bold">Sign Up</p>
            <FormBuilder
                :form="form"
                :call="call"
                button-text="Sign Up"
                layout-class="gap-1"
            />
            <div class="w-full border-t border-gray-600"></div>
            <a
                href="/sign-in"
                class="text-md underline text-gray-500 hover:text-current"
                >Already have an account?</a
            >
        </div>
    </div>
</template>

<script lang="ts">
//
import { register } from 'src/repository/authentication';
import { emailRegex, fullNameRegex, passwordRegex } from 'src/constants/regex';
import { IFormField } from 'src/app/components/form/form.types';

//
import FormBuilder from 'src/app/components/form/main.vue';

export default {
    name: 'SignInPage',
    components: {
        FormBuilder,
    },
    data() {
        return {
            form: {
                name: {
                    label: 'Name',
                    placeHolder: 'Enter your name',
                    type: 'text',
                    required: true,
                    value: '',
                    requiredLabel: 'Please enter your name',
                    validations: [
                        {
                            type: 'regex',
                            validate: fullNameRegex,
                            message: 'Invalid name',
                        },
                    ],
                },
                email: {
                    label: 'Email',
                    placeHolder: 'Enter your email',
                    type: 'text',
                    required: true,
                    value: '',
                    requiredLabel: 'Please enter your email',
                    validations: [
                        {
                            type: 'regex',
                            validate: emailRegex,
                            message: 'Invalid email',
                        },
                    ],
                },
                password: {
                    label: 'Password',
                    placeHolder: 'Enter your password',
                    type: 'password',
                    required: true,
                    value: '',
                    requiredLabel: 'Please enter your password',
                    validations: [
                        {
                            type: 'regex',
                            validate: passwordRegex,
                            message:
                                'Password must contain at least one uppercase letter, one lower case, one number, one symbol(@$!%*?&#), and be at least 8 characters long',
                        },
                    ],
                },
                confirmPassword: {
                    label: 'Confirm Password',
                    placeHolder: 'Re-enter your password',
                    type: 'password',
                    required: true,
                    value: '',
                    requiredLabel: 'Please enter confirmation password',
                },
            } as Record<string, IFormField>,
        };
    },
    methods: {
        async call(payload: ILargeRecord) {
            const res = await register(payload);
            return !res.error;
        },
    },
};
</script>
