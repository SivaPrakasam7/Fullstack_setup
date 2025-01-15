<template>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <svg :key="svgContent" v-html="svgContent"></svg>
</template>

<script lang="ts">
import { getSvgIcon } from 'virtual:svg-icons';

export default {
    name: 'SvgIcon',
    props: {
        path: {
            required: true,
            type: String,
        },
    },
    data() {
        return {
            svgContent: '',
        };
    },
    mounted() {
        this.svgContent = getSvgIcon(this.path.split('/').slice(-2).join('/'));
    },
};
</script>
