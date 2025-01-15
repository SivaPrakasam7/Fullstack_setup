<template>
    <div
        class="flex flex-col gap-5 items-center justify-center h-screen w-screen"
    >
        <h1 data-testid="INIT" className="text-3xl font-bold">
            {{ content }}
        </h1>
        <button class="app-button" @click="goToHome">Home</button>
    </div>
</template>

<script lang="ts">
export default {
    name: 'CommonPage',
    props: {
        content: {
            type: String,
            default: 'Common page content',
        },
    },
    methods: {
        goToHome() {
            this.$router.push({ name: 'main' });
        },
    },
};
</script>
