<template>
    <section id="about" class="p-about-intro">
        <div class="p-about-intro__inner">
            <div class="p-about-intro__block">
                <h3 class="p-about-intro__name">AYAKA NAKAMURA</h3>
                <p class="p-about-intro__desc">
                    After working as a test engineer for two and a half years,<br />
                    joined the PR company as an website operator. <br />
                    After a two-year dispatch period, currently I've been involved in website production.<br /><br />
                </p>
            </div>
            <div class="p-about-intro__block">
                <h3 class="p-about-intro__name">SKILLS</h3>
                <p class="p-about-intro__skills">
                    <span class="p-about-intro__skill">HTML</span>
                    <span class="p-about-intro__skill">CSS</span>
                    <span class="p-about-intro__skill">JavaScript</span>
                    <span class="p-about-intro__skill">Vue.js</span>
                    <span class="p-about-intro__skill">Nuxt.js</span>
                    <span class="p-about-intro__skill">Three.js</span>
                    <span class="p-about-intro__skill">React.js</span>
                    <span class="p-about-intro__skill">Typescript</span>
                    <span class="p-about-intro__skill">PHP</span>
                    <span class="p-about-intro__skill">Laravel</span>
                    <span class="p-about-intro__skill">WordPress</span>
                    <span class="p-about-intro__skill">Docker</span>
                </p>
            </div>
        </div>
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
    methods: {},
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/about/_intro';
</style>
