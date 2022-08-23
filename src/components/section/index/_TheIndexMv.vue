<template>
    <section id="mv" class="p-index-mv" data-mv>
        <!-- <TheCanvas :sectionName="'mv'" /> -->
        <div class="p-index-mv__title"></div>
        <div class="p-index-mv__bg js-trigger">
            <div class="p-index-mv__bg-horizontal" data-horizontal="bg-line">
                <div data-horizontal="pin">
                    <div class="p-index-mv__bg-anim to-right" data-horizontal="anim">
                        <div class="p-index-mv__bg-line p-index-mv__bg-line--top">
                            <canvas
                                class="p-index-mv__bg-canvas p-index-mv__bg-canvas--top"
                                data-mv-line="canvas"
                            ></canvas>
                            <div class="p-index-mv__name-wrap">
                                <div class="p-index-mv__name">AYAKA NAKAMURA</div>
                                <!-- <div class="p-index-mv__name">AYAKA NAKAMURA</div>
                                <div class="p-index-mv__name">AYAKA NAKAMURA</div>
                                <div class="p-index-mv__name">AYAKA NAKAMURA</div>
                                <div class="p-index-mv__name">AYAKA NAKAMURA</div>
                                <div class="p-index-mv__name">AYAKA NAKAMURA</div> -->
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
                            ></canvas>
                            <div class="p-index-mv__position-wrap">
                                <div class="p-index-mv__position">FRONT-END ENGINEER</div>
                                <!-- <div class="p-index-mv__position">FRONT-END ENGINEER</div>
                                <div class="p-index-mv__position">FRONT-END ENGINEER</div>
                                <div class="p-index-mv__position">FRONT-END ENGINEER</div>
                                <div class="p-index-mv__position">FRONT-END ENGINEER</div>
                                <div class="p-index-mv__position">FRONT-END ENGINEER</div>
                                <div class="p-index-mv__position">FRONT-END ENGINEER</div> -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts" scoped>
import Vue from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import BaseImage from '~/components/common/TheBaseImage.vue';
import { addClass, removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';
import Particles from '~/assets/scripts/components/section/index/particles';
import { loadingStore } from '~/store';

interface MvOptions {
    mvAnim: {
        [key: string]: number;
    };
    canvasList: NodeListOf<HTMLCanvasElement>;
    particles: Particles[];
}
export default Vue.extend({
    components: {
        BaseImage,
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
    mounted() {
        if (this.loading) this.init();
    },
    methods: {
        init(): void {
            gsap.registerPlugin(ScrollTrigger);
            this.moveLine();
            this.canvasList = document.querySelectorAll("[data-mv-line='canvas']");
            this.canvasList.forEach((target, index) => {
                this.particles[index] = new Particles(target, index);
            });
            window.addEventListener('resize', this.handleResize.bind(this));
            this.$router.beforeEach(async (_to, _from, next) => {
                console.log('photo');
                this.canvasList.forEach((_, index) => {
                    console.log("particle");
                    this.particles[index].cancel();
                });
                next();
            });
        },
        moveLine(): void {
            const horizontalLine = gsap.utils.toArray<HTMLElement>("[data-horizontal='bg-line']");
            horizontalLine.forEach((line) => {
                const pinWrap = line.querySelector("[data-horizontal='pin']");
                const animWrap = pinWrap.querySelector("[data-horizontal='anim']");
                const circle = document.querySelector('[data-circle]');
                const box = document.querySelector('.p-box');
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
            console.log('mv');
            this.particles.forEach((particle) => {
                particle.handleResize();
            });
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/index/_mv';
</style>
