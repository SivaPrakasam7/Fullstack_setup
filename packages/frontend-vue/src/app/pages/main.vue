<template>
    <div
        class="flex flex-col gap-5 items-center justify-center h-screen w-screen"
    >
        <h1 data-testid="INIT" className="text-3xl font-bold">
            {{ appName }}
        </h1>
        <p>
            {{
                isSignedIn
                    ? `${name} logged in successfully`
                    : 'User need to login'
            }}
        </p>
        <button v-if="isSignedIn" class="app-button" @click="logout">
            Logout
        </button>
        <div v-else class="flex gap-2">
            <button class="app-button" @click="goToSignIn">Sign In</button>
            <button class="app-button" @click="goToSignUp">Sign Up</button>
        </div>
    </div>
</template>

<script lang="ts">
import { store } from 'src/store';
import { logout } from 'src/repository/authentication';

export default {
    name: 'MainPage',
    data() {
        return {
            appName: import.meta.env.VITE_APP_NAME,
            logout: logout,
        };
    },
    computed: {
        name() {
            return store.state.user?.name;
        },
        isSignedIn() {
            return !!store.state.user?.userId;
        },
    },

    methods: {
        goToSignIn() {
            this.$router.push({ name: 'signIn' });
        },
        goToSignUp() {
            this.$router.push({ name: 'signUp' });
        },
    },
};
</script>
