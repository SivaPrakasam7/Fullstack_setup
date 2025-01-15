<template>
    <div class="flex flex-col items-center justify-center h-screen w-screen">
        <div class="max-w-[400px] w-full flex flex-col gap-2 p-2">
            <p class="text-4xl font-bold">Sign In</p>
            <FormBuilder
                :form="form"
                :call="call"
                button-text="Sign In"
                layout-class="gap-1"
            />
            <div class="w-full border-t border-gray-600"></div>
            <div class="flex flex-row justify-between">
                <a
                    href="/sign-up"
                    class="text-md underline text-gray-500 hover:text-current"
                    >Create new account</a
                >
                <a
                    href="/forgot-password"
                    class="text-md underline text-gray-500 hover:text-current"
                    >Forgot password?</a
                >
            </div>
        </div>
    </div>
</template>

<script lang="ts">
//
import { login } from 'src/repository/authentication';
import { emailRegex } from 'src/constants/regex';
import { store } from 'src/store';
import { IFormField } from 'src/app/components/form/form.types';

//
import FormBuilder from 'src/app/components/form/main.vue';

//
export default {
    name: 'SignInPage',
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
                password: {
                    label: 'Password',
                    placeHolder: 'Enter your password',
                    type: 'password',
                    required: true,
                    value: '',
                    requiredLabel: 'Please enter your password',
                },
            } as Record<string, IFormField>,
        };
    },
    methods: {
        async call(payload: ILargeRecord) {
            const res = await login(payload);
            if (!res.error) {
                await store.commit('getProfile', () => {
                    this.$router.push({ name: 'main' });
                });
            }
            return !res.error;
        },
    },
};
</script>
