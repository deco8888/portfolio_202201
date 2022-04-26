<template>
    <div :class="`c-lottie ${className}`" ref="LottieContainer"></div>
</template>

<script lang="ts">
import Vue from 'vue';
import lottie from 'lottie-web';

export default Vue.extend({
    props: {
        className: {
            type: String,
            required: true,
            default: '',
        },
        data: {
            type: Object,
            required: true,
            default: '',
        },
    },
    mounted() {
        const anim = lottie.loadAnimation({
            container: <Element>this.$refs.LottieContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: this.data,
        });
        anim.play();
    },
});
</script>
