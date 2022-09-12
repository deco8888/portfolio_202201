<template>
    <div class="c-transition" data-transition>
        <div :class="['c-transition__wrap', `c-transition__wrap--${$route.name}`]" data-transition-wrap>
            <div class="c-transition__block c-transition__block--before" data-transition-block="before"></div>
            <div
                class="c-transition__block c-transition__block--after"
                ref="blockAfter"
                data-transition-block="after"
            ></div>
            <div class="c-transition__box" data-transition-box></div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gsap, { Power4 } from 'gsap';
import { isMobile } from '~/assets/scripts/modules/isMobile';

const Transition = Vue.extend({
    props: {
        isTransition: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data(): {
        isMobile: boolean;
    } {
        return {
            isMobile: isMobile(),
        };
    },
    methods: {
        async start(): Promise<void> {
            return new Promise<void>((resolve) => {
                const winWidth = window.innerWidth;
                const winHeight = window.innerHeight;
                const paddingTop = this.isMobile ? `${(winHeight / winWidth) * 100}%` : '100%';
                const borderWidth = winWidth > winHeight ? winWidth * 0.5 : winHeight * 0.5;
                const tl = gsap.timeline({
                    paused: true,
                    ease: Power4.easeOut,
                });
                tl.set('[data-transition]', {
                    zIndex: 10000,
                });
                tl.set('[data-transition-wrap]', {
                    paddingTop,
                });
                tl.to('[data-transition-block="before"]', {
                    duration: 0.7,
                    borderWidth: borderWidth + 20,
                });
                tl.to(
                    '[data-transition-block="after"]',
                    {
                        duration: 0.7,
                        borderWidth: borderWidth + 20,
                        onComplete: () => {
                            resolve();
                        },
                    },
                    '<'
                );
                // tl.set(
                //     '[data-transition-block="after"]',
                //     {
                //         borderWidth: borderWidth + 20,
                //         onComplete: () => {
                //             resolve();
                //         },
                //     },
                //     '>'
                // );
                // tl.to(
                //     '[data-transition-box]',
                //     {
                //         duration: 1,
                //         scale: 1,
                //         onComplete: () => {
                //             resolve('やっほ');
                //         },
                //     },
                //     '>'
                // );
                tl.play();
            });
        },
    },
});

export default Transition;
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/common/_transition';
</style>
