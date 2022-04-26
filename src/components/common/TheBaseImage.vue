<template>
    <img
        v-if="getPcImg"
        :src="getPcImg"
        :alt="alt"
        :width="width || null"
        :height="height || null"
        :decodingAsync="decodingAsync || null"
    />
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    props: {
        pcImg: {
            type: String,
            required: true,
            default: '',
        },
        folder: {
            type: String,
            required: false,
            default: '',
        },
        alt: {
            type: String,
            required: true,
            default: '',
        },
        width: {
            type: Number,
            required: false,
            default: '',
        },
        height: {
            type: Number,
            required: false,
            default: '',
        },
        decodingAsync: {
            type: Boolean,
            required: false,
            default: '',
        },
    },
    computed: {
        getPcImg(): any {
            if (this.pcImg) return require(`~/assets/images/pc/${this.pcImg}`);
        },
    },
});
</script>
