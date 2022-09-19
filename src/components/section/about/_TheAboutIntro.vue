<template>
    <section id="about" class="p-about-intro">
        <div class="p-about-intro__inner">
            <div></div>
            <div>
                <div class="p-about-intro__block">
                    <h3 class="p-about-intro__name">AYAKA NAKAMURA</h3>
                    <p class="p-about-intro__desc">
                        Based in Tokyo and Kanagawa.<br />
                        After working as a test engineer for two and a half years, joined the PR company as an website
                        operator. <br />
                        After a two-year dispatch period, currently I've been involved in website production.<br /><br />
                    </p>
                </div>
                <div class="p-about-intro__block">
                    <h3 class="p-about-intro__name">SKILLS</h3>
                    <p class="p-about-intro__note">
                        ※On the back of the card, stars are displayed for the number of years of experience.
                    </p>
                    <div class="p-about-intro__skills">
                        <div
                            v-for="(skill, index) in skillList"
                            :key="index"
                            :class="['p-about-intro__skill-card', { 'is-flip': isFlip }]"
                            @click="flip($event)"
                        >
                            <span class="p-about-intro__skill p-about-intro__skill--front" data-flip="front">
                                {{ skill.name }}
                            </span>
                            <span class="p-about-intro__skill p-about-intro__skill--back" data-flip="back">
                                {{ skill.period }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div></div>
        </div>
    </section>
</template>

<script lang="ts">
import Vue from 'vue';
import gsap, { Power4 } from 'gsap';
import { isMobile } from '~/assets/scripts/modules/isMobile';

export default Vue.extend({
    data(): {
        skillList: {
            name: string;
            period: string;
        }[];
        isFlip: boolean;
        isMobile: boolean;
    } {
        return {
            skillList: [
                {
                    name: 'HTML',
                    period: '★★★★',
                },
                {
                    name: 'CSS',
                    period: '★★★★',
                },
                {
                    name: 'JavaScript',
                    period: '★★★★',
                },
                {
                    name: 'Vue.js',
                    period: '★★★',
                },
                {
                    name: 'Three.js',
                    period: '★★★',
                },
                {
                    name: 'Nuxt.js',
                    period: '★★★',
                },
                {
                    name: 'React.js',
                    period: '★',
                },
                {
                    name: 'Typescript',
                    period: '★★',
                },
                {
                    name: 'PHP',
                    period: '★★',
                },
                {
                    name: 'Laravel',
                    period: '★★',
                },
                {
                    name: 'WordPress',
                    period: '★★★',
                },
                {
                    name: 'Docker',
                    period: '★★',
                },
            ],
            isFlip: false,
            isMobile: isMobile(),
        };
    },
    mounted() {
        window.addEventListener('resize', () => {
            this.isMobile = isMobile();
        });
    },
    methods: {
        flip(e: Event): void {
            if (!this.isMobile) return;
            const target = e.target as HTMLElement;
            const isFront = target.getAttribute('data-flip') === 'front';
            const another = target.previousElementSibling || target.nextElementSibling;
            if (!this.isFlip && isFront) {
                gsap.to(target, {
                    rotateY: '180deg',
                });
                gsap.to(another, {
                    rotateY: '360deg',
                    onComplete: () => {
                        this.isFlip = true;
                    },
                });
            } else {
                gsap.to(target, {
                    rotateY: '180deg',
                });
                gsap.to(another, {
                    rotateY: '0deg',
                    onComplete: () => {
                        this.isFlip = false;
                    },
                });
            }
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/about/_intro';
</style>

function isContains(active: any) { throw new Error('Function not implemented.'); }
