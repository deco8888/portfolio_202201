<template>
    <section id="about" class="p-about-intro">
        <!-- <div class="p-about-intro__title"></div>
        <div class="p-about-intro__bg js-trigger">
            <div class="p-about-intro__bg-horizontal" data-horizontal="bg-line">
                <div data-horizontal="pin">
                    <div class="p-about-intro__bg-anim to-right" data-horizontal="anim">
                        <div class="p-about-intro__bg-line p-about-intro__bg-line--top"></div>
                    </div>
                </div>
            </div>
            <div class="p-about-intro__bg-horizontal" data-horizontal="bg-line">
                <div data-horizontal="pin">
                    <div class="p-about-intro__bg-anim to-left" data-horizontal="anim">
                        <div class="p-about-intro__bg-line p-about-intro__bg-line--bottom"></div>
                    </div>
                </div>
            </div>
        </div> -->
    </section>
</template>

<script lang="ts">
import Vue from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

export default Vue.extend({
    mounted() {
        // gsap.registerPlugin(ScrollTrigger);
        // this.moveLine();
    },
    methods: {

    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/about/_intro';
</style>
