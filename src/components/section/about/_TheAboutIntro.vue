<template>
    <section id="about" class="p-about-intro">
        <div class="p-about-intro__inner">
            <div class="p-about-intro__block">
                <h3 class="p-about-intro__name">AYAKA NAKAMURA</h3>
                <p class="p-about-intro__desc">
                    After working as a test engineer for two and a half years,<br class="pc-class" />joined the PR
                    company as an website operator. <br />
                    After a two-year dispatch period, currently I've been involved in website production.<br /><br />
                </p>
            </div>
            <div class="p-about-intro__block">
                <h3 class="p-about-intro__name">SKILLS</h3>
                <p class="p-about-intro__skills">
                    <span v-for="(skill, index) in skillList" :key="index" class="p-about-intro__skill">
                        {{ skill.name }}
                    </span>
                </p>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    data() {
        return {
            skillList: [
                {
                    name: 'HTML',
                },
                {
                    name: 'CSS',
                },
                {
                    name: 'JavaScript',
                },
                {
                    name: 'Vue.js',
                },
                {
                    name: 'Three.js',
                },
                {
                    name: 'Nuxt.js',
                },
                {
                    name: 'React.js',
                },
                {
                    name: 'Typescript',
                },
                {
                    name: 'PHP',
                },
                {
                    name: 'Laravel',
                },
                {
                    name: 'WordPress',
                },
                {
                    name: 'Docker',
                },
            ],
        };
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/about/_intro';
</style>
