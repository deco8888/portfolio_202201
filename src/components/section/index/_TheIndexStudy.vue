<template>
    <section id="study" class="p-index-study">
        <div class="p-index-study__inner js-study-trigger">
            <!-- <TheCanvas :sectionName="'study'" /> -->
            <div class="p-index-study__canvas" data-study="canvas"></div>
            <div class="p-index-study__wrap" data-horizontal="wrapper">
                <!-- <div class="p-index-study__expansion" data-expansion="canvas">
                    <div class="p-index-study__expansion-canvas" data-expansion="expansion"></div>
                    <div class="p-index-study__content">
                        <p>TEST</p>
                    </div>
                </div> -->
                <!-- <TheContact /> -->
                <div class="p-index-study__list" data-horizontal="list">
                    <div class="p-index-study__image-wrap p-index-study__image-wrap--image1">
                        <div
                            class="p-index-study__image"
                            data-study="image"
                            data-study-image="sakura.jpg"
                            data-study-title="No.1"
                            data-study-link="https://hatarakigai.info/project/"
                        ></div>
                    </div>
                    <div class="p-index-study__image-wrap p-index-study__image-wrap--image2">
                        <div
                            class="p-index-study__image"
                            data-study="image"
                            data-study-image="sakura.jpg"
                            data-study-title="No.2"
                            data-study-link="https://works.yuta-takahashi.dev/"
                        ></div>
                    </div>
                    <div class="p-index-study__image-wrap p-index-study__image-wrap--image3">
                        <div
                            class="p-index-study__image"
                            data-study="image"
                            data-study-image="sakura.jpg"
                            data-study-title="No.3"
                            data-study-link="https://nuxtjs.org/ja/docs/concepts/views/#layouts"
                        ></div>
                    </div>
                </div>
                <div class="p-index-study-expansion" data-expansion="wrapper">
                    <div class="p-index-study-expansion__inner">
                        <div
                            class="p-index-study-expansion__item"
                            data-expansion="item"
                            data-cursor-target
                            @click="clickItem"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import Vue from 'vue';
// import TheCanvas from '../common/TheCanvas.vue';
import Expansion from '~/assets/scripts/components/expansion';
import Title from '~/assets/scripts/components/parts/contact/title';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import BaseImage from '~/components/common/TheBaseImage.vue';
import TheContact from '~/components/parts/TheContact.vue';
import Study from '~/assets/scripts/components/study';
import { addClass, removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';

interface StudyOptions {
    study: Study;
    studyAnim: {
        [key: string]: number;
    };
    expansion: Expansion;
    title: Title;
}

export default Vue.extend({
    components: {
        BaseImage,
        TheContact,
    },
    data(): StudyOptions {
        return {
            study: null,
            studyAnim: {
                previous: 0,
                current: 0,
                ease: 0.1,
            },
            expansion: null,
            title: null,
        };
    },
    mounted() {
        gsap.registerPlugin(ScrollTrigger);
        this.test();
        this.study = new Study();
    },
    methods: {
        test() {
            const horizontalWrapper = document.querySelector("[data-horizontal='wrapper']");
            const horizontalList = document.querySelector("[data-horizontal='list']");
            const box = document.querySelector('[data-expansion="wrapper"]');
            gsap.to(horizontalList, {
                x: () => -(horizontalList.clientWidth - horizontalWrapper.clientWidth),
                ease: 'none',
                scrollTrigger: {
                    trigger: '.js-study-trigger',
                    markers: true,
                    start: 'top top',
                    end: () => '+=' + (horizontalList.clientWidth - horizontalWrapper.clientWidth),
                    onLeave: () => {
                        addClass(box, hasClass.active);
                    },
                    onEnterBack: () => {
                        removeClass(box, hasClass.active);
                    },
                    pin: true,
                    anticipatePin: 1, // 素早くスクロールしたときにピン留めが少し遅れ、ガタつくのを防ぐ。
                    invalidateOnRefresh: true, // リサイズに関係する
                    scrub: true, // アニメーションをスクロール位置にリンクさせる
                },
            });
        },
        async clickItem(): Promise<void> {
            this.expansion = new Expansion();
            this.expansion.init();
            await this.expansion.start();
            this.title = new Title();
            this.title.init();
            this.handleEvent();
            this.$emit('is-show', true);
        },
        handleEvent(): void {
            window.addEventListener(
                'mousemove',
                (e: MouseEvent) => {
                    this.title.handleMove(e);
                },
                false
            );
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/index/_study';
</style>
