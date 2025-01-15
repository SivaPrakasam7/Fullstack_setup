<template>
    <div
        class="flex flex-col gap-5 items-center justify-center h-screen w-screen"
    >
        <div class="max-w-[400px] w-full flex flex-col gap-2 p-2">
            <p class="text-4xl font-bold">Forgot Password</p>
            <FormBuilder
                :form="form"
                :call="call"
                button-text="Request reset password link"
                layout-class="gap-1"
            />
            <div class="w-full border-t border-gray-600"></div>
            <a
                href="/sign-in"
                class="text-md underline text-gray-500 hover:text-current"
                >Back to login</a
            >
        </div>
    </div>
</template>

<script lang="ts">
//
import { requestResetPassword } from 'src/repository/authentication';
import { emailRegex } from 'src/constants/regex';
import { IFormField } from 'src/app/components/form/form.types';

//
import FormBuilder from 'src/app/components/form/main.vue';

export default {
    name: 'ForgotPasswordPage',
    components: {
        FormBuilder,
    },
    data() {
        return {
            form: {
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
            } as Record<string, IFormField>,
        };
    },
    methods: {
        async call(payload: ILargeRecord) {
            const res = await requestResetPassword(payload);
            return !res.error;
        },
    },
};
</script>
