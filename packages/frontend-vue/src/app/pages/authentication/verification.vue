<template>
    <div
        class="flex flex-col gap-5 items-center justify-center h-screen w-screen"
    >
        <h1
            data-testid="MESSAGE"
            :class="[
                'text-3xl font-bold flex gap-2 items-center justify-center',
                error ? 'text-red-500' : 'text-green-500',
            ]"
        >
            <SvgIcon path="/icons/svg/error.svg" class="h-8 w-8"></SvgIcon>
            {{ message }}
        </h1>
        <button class="app-button" @click="goToHome">Home</button>
    </div>
</template>

<script lang="ts">
import { verifyEmailAccount } from 'services/repository/authentication';
import { routes } from 'services/constants/routes';

//
import SvgIcon from 'src/app/components/svg.vue';

//
export default {
    name: 'VerificationPage',
    components: { SvgIcon },
    data() {
        return {
            error: '',
            message: '',
        };
    },
    mounted() {
        if (!this.$router.currentRoute.value.query.token) {
            this.$router.push({ path: routes.root });
        } else
            verifyEmailAccount(
                this.$router.currentRoute.value.query.token as string
            ).then((res) => {
                this.error = res.error;
                this.message = res.message;
            });
    },
    methods: {
        goToHome() {
            this.$router.push({ path: routes.root });
        },
    },
};
</script>
