<template>
    <div class="p-about-transition" data-transition="wrapper">
        <div class="p-about-transition__canvas" data-transition="canvas"></div>
        <div class="p-about-transition__inner">
            <div class="p-about-transition__item" data-transition="item" @click="clickItem"></div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Transition from '~/assets/scripts/components/transition';

export default Vue.extend({
    data(): {
        transition: Transition;
    } {
        return {
            transition: null,
        };
    },
    mounted() {
        // gsap.registerPlugin(ScrollTrigger);
        // this.moveLine();
        // window.addEventListener('load', async () => {
        this.transition = new Transition();
        this.transition.init();
    },
    methods: {
        async clickItem(): Promise<void> {
            console.log("clicl");
            await this.transition.start();
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/about/_transition';
</style>
