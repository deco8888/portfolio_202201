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
            default: 0,
        },
        height: {
            type: Number,
            required: false,
            default: 0,
        },
        decodingAsync: {
            type: Boolean,
            required: false,
            default: true,
        },
    },
    computed: {
        // eslint-disable-next-line vue/return-in-computed-property
        getPcImg(): any {
            if (this.pcImg) return require(`~/assets/images/pc/${this.pcImg}`);
        },
    },
});
</script>
