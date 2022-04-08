<template>
    <section id="mv" class="p-mv">
        <!-- <TheCanvas :sectionName="'mv'" /> -->
        <div class="p-mv__title"></div>
        <div class="p-mv__bg js-trigger">
            <div class="p-mv__bg-horizontal" data-horizontal="bg-line">
                <div data-horizontal="pin">
                    <div class="p-mv__bg-anim to-right" data-horizontal="anim">
                        <div class="p-mv__bg-line p-mv__bg-line--top"></div>
                    </div>
                </div>
            </div>
            <div class="p-mv__bg-horizontal" data-horizontal="bg-line">
                <div data-horizontal="pin">
                    <div class="p-mv__bg-anim to-left" data-horizontal="anim">
                        <div class="p-mv__bg-line p-mv__bg-line--bottom"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import Vue from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Art from '~/assets/scripts/components/art';

export default Vue.extend({
    data() {
        return {
            mvAnim: {
                previous: 0,
                current: 0,
                ease: 0.1,
            },
        };
    },
    mounted() {
        // eslint-disable-next-line no-new
        new Art({
            canvas: null,
            ctx: null,
        });
        gsap.registerPlugin(ScrollTrigger);
        this.moveLine();
    },
    methods: {
        moveLine(): void {
            const horizontalLine = gsap.utils.toArray<HTMLElement>("[data-horizontal='bg-line']");
            horizontalLine.forEach((line) => {
                const pinWrap = line.querySelector("[data-horizontal='pin']");
                const animWrap = pinWrap.querySelector("[data-horizontal='anim']");
                const xStart = (): number => (animWrap.classList.contains('to-right') ? -window.innerWidth : 0);
                const xEnd = (): number =>
                    animWrap.classList.contains('to-right') ? -animWrap.scrollWidth : window.innerWidth;
                gsap.fromTo(
                    animWrap,
                    {
                        x: () => xStart(),
                    },
                    {
                        x: () => xEnd(),
                        // ease: 'none',
                        scrollTrigger: {
                            trigger: '.js-trigger',
                            start: 'top top',
                            end: () => {
                                return '+=' + (animWrap.scrollWidth - window.innerWidth);
                            },
                            pin: true,
                            anticipatePin: 1, // 素早くスクロールしたときにピン留めが少し遅れ、ガタつくのを防ぐ。
                            invalidateOnRefresh: true, // リサイズに関係する
                            scrub: 0.3, // スクロールの進捗とアニメーションの進捗をリンクさせる
                        },
                        duration: 3,
                    }
                );
            });
        },
        // setEnd(): void {
        //     this.mvAnim.current = animWrap.scrollWidth - window.innerWidth:

        // }
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/_mv';
</style>
