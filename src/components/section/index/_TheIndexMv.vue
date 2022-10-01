<template>
    <section id="mv" class="p-index-mv" data-mv>
        <!-- <TheCanvas :sectionName="'mv'" /> -->
        <div class="p-index-mv__bg js-trigger">
            <div class="p-index-mv__bg-horizontal" data-horizontal="bg-line">
                <div data-horizontal="pin">
                    <div class="p-index-mv__bg-anim to-right" data-horizontal="anim">
                        <div class="p-index-mv__bg-line p-index-mv__bg-line--top">
                            <canvas
                                class="p-index-mv__bg-canvas p-index-mv__bg-canvas--top"
                                data-mv-line="canvas"
                                data-mv-line-pos="top"
                            ></canvas>
                            <div class="p-index-mv__name-wrap">
                                <p :class="['p-index-mv__name', { 'is-active': isActive }]">
                                    <span
                                        v-for="(word, index1) in splitWord('firstName')"
                                        :key="index1"
                                        class="p-index-mv__name-char"
                                        data-split-char="name"
                                    >
                                        {{ word }}
                                    </span>
                                    &nbsp;
                                    <span
                                        v-for="(word, index2) in splitWord('familyName')"
                                        :key="splitWord('firstName').length + index2 + 1"
                                        class="p-index-mv__name-char"
                                        data-split-char="name"
                                    >
                                        {{ word }}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-index-mv__bg-horizontal" data-horizontal="bg-line">
                <div data-horizontal="pin">
                    <div class="p-index-mv__bg-anim to-left" data-horizontal="anim">
                        <div class="p-index-mv__bg-line p-index-mv__bg-line--bottom">
                            <canvas
                                class="p-index-mv__bg-canvas p-index-mv__bg-canvas--bottom"
                                data-mv-line="canvas"
                                data-mv-line-pos="bottom"
                            ></canvas>
                            <div class="p-index-mv__position-wrap">
                                <p :class="['p-index-mv__position', { 'is-active': isActive }]">
                                    <span
                                        v-for="(word, index3) in splitWord('front')"
                                        :key="index3"
                                        class="p-index-mv__position-char"
                                        data-split-char="position"
                                    >
                                        {{ word }}
                                    </span>
                                    &nbsp;
                                    <span
                                        v-for="(word, index4) in splitWord('rear')"
                                        :key="splitWord('rear') + index4 + 1"
                                        class="p-index-mv__position-char"
                                        data-split-char="position"
                                    >
                                        {{ word }}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <TheIndexBalloon :isShow="isActive" :color="'purple'" />
        <TheIndexBalloon :isShow="isActive" :color="'orange'" />
    </section>
</template>

<script lang="ts" scoped>
import Vue from 'vue';
import gsap from 'gsap';
import BaseImage from '~/components/common/BaseImage.vue';
import TheIndexBalloon from '~/components/parts/index/TheIndexBalloon.vue';
import Particles from '~/assets/scripts/components/section/index/particles';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { addClass, removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';
import { loadingStore } from '~/store';
import { isMobile } from '~/assets/scripts/modules/isMobile';

interface MvOptions {
    mvAnim: {
        [key: string]: number;
    };
    canvasList: NodeListOf<HTMLCanvasElement>;
    particles: Particles[];
    string: {
        [key: string]: string;
    };
    isMobile: boolean;
}
export default Vue.extend({
    components: {
        BaseImage,
        TheIndexBalloon,
    },
    props: {
        isActive: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data(): MvOptions {
        return {
            mvAnim: {
                previous: 0,
                current: 0,
                ease: 0.1,
            },
            canvasList: null,
            particles: [],
            string: {
                firstName: 'AYAKA',
                familyName: 'NAKAMURA',
                front: 'FRONT-END',
                rear: 'ENGINEER',
            },
            isMobile: isMobile()
        };
    },
    watch: {
        loading(val: boolean) {
            if (val) this.init();
        },
    },
    computed: {
        loading(): boolean {
            return loadingStore.getLoading.loaded;
        },
    },
    methods: {
        init(): void {
            // スクロールトリガー
            gsap.registerPlugin(ScrollTrigger);
            // 上下のライン・左右にスクロール
            this.moveLine();
            // パーティクル用Canvas
            this.canvasList = document.querySelectorAll("[data-mv-line='canvas']");
            this.canvasList.forEach((target, index) => {
                this.particles[index] = new Particles(target, index);
            });
            // 1文字に切り分ける
            this.splitText();
            // リサイズ
            window.addEventListener('resize', this.handleResize.bind(this));
            // 画面遷移時に「cancelAnimationFrame」を実行
            this.$router.beforeEach(async (_to, _from, next) => {
                this.canvasList.forEach((_, index) => {
                    this.particles[index].cancel();
                });
                next();
            });
        },
        moveLine(): void {
            const horizontalLine = gsap.utils.toArray<HTMLElement>("[data-horizontal='bg-line']");
            horizontalLine.forEach((line) => {
                const pinWrap = line.querySelector("[data-horizontal='pin']");
                const animWrap = pinWrap.querySelector<HTMLElement>("[data-horizontal='anim']");
                const circle = document.querySelector('[data-circle]');
                const box = document.querySelector('.p-index-box');
                animWrap.style.height = `${window.innerHeight * 0.5}px`;
                const xStart = (): number =>
                    pinWrap.querySelector("[data-horizontal='anim']").classList.contains('to-right')
                        ? - document.querySelector<HTMLElement>('.p-page').clientWidth //window.innerWidth
                        : 0;
                const xEnd = (): number =>
                    animWrap.classList.contains('to-right')
                        ? -pinWrap.querySelector("[data-horizontal='anim']").scrollWidth
                        : window.innerWidth;
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
                                return (
                                    '+=' +
                                    (pinWrap.querySelector("[data-horizontal='anim']").scrollWidth - window.innerWidth)
                                );
                            },
                            onUpdate: () => {
                                if (window.scrollY >= window.innerWidth / 2.5) {
                                    addClass(circle, hasClass.active);
                                    addClass(box, hasClass.active);
                                } else {
                                    removeClass(circle, hasClass.active);
                                    removeClass(box, hasClass.active);
                                }
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
        handleResize(): void {
            const horizontalLine = gsap.utils.toArray<HTMLElement>("[data-horizontal='bg-line']");
            horizontalLine.forEach((line) => {
                const pinWrap = line.querySelector("[data-horizontal='pin']");
                const animWrap = pinWrap.querySelector<HTMLElement>("[data-horizontal='anim']");
                animWrap.style.height = `${window.innerHeight * 0.5}px`;
            });
            this.particles.forEach((particle) => {
                particle.handleResize();
            });
        },
        splitText(): void {
            const charList = document.querySelectorAll<HTMLElement>(`[data-split-char]`);
            charList.forEach((char, index) => {
                char.style.animationDelay = `${index * 0.04 + 0.3}s`;
                char.style.setProperty('--char-index', `${index}`);
            });
        },
        splitWord(key: string): string[] {
            return this.string[key].split('');
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/index/_mv';
</style>
