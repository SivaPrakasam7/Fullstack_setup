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
                <div
                    class="text-md underline text-gray-500 hover:text-current"
                    @click="$router.push({ name: 'signUp' })"
                >
                    Create new account
                </div>
                <div
                    class="text-md underline text-gray-500 hover:text-current"
                    @click="$router.push({ name: 'forgotPassword' })"
                >
                    Forgot password?
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
//
import { login } from 'services/repository/authentication';
import { emailRegex } from 'services/constants/regex';
import { routes } from 'services/constants/routes';
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
                    this.$router.push({ path: routes.root });
                });
            }
            return !res.error;
        },
    },
};
</script>
