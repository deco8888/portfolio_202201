<template>
    <section id="study" class="p-study">
        <div class="p-study__inner js-study-trigger">
            <!-- <TheCanvas :sectionName="'study'" /> -->
            <div class="p-study__canvas" data-study="canvas"></div>
            <div class="p-study__wrap" data-horizontal="wrapper">
                <div class="p-study__list" data-horizontal="list">
                    <div class="p-study__image-wrap p-study__image-wrap--image1">
                        <div
                            class="p-study__image"
                            data-study="image"
                            data-study-image="sakura.jpg"
                            data-study-link="https://hatarakigai.info/project/"
                        ></div>
                    </div>
                    <div class="p-study__image-wrap p-study__image-wrap--image2">
                        <div
                            class="p-study__image"
                            data-study="image"
                            data-study-image="sakura.jpg"
                            data-study-link="https://works.yuta-takahashi.dev/"
                        ></div>
                    </div>
                    <div class="p-study__image-wrap p-study__image-wrap--image3">
                        <div
                            class="p-study__image"
                            data-study="image"
                            data-study-image="sakura.jpg"
                            data-study-link="https://nuxtjs.org/ja/docs/concepts/views/#layouts"
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
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import BaseImage from '~/components/common/TheBaseImage.vue';
import Study from '~/assets/scripts/components/study';

export default Vue.extend({
    components: {
        BaseImage,
    },
    data() {
        return {
            studyAnim: {
                previous: 0,
                current: 0,
                ease: 0.1,
            },
        };
    },
    mounted() {
        gsap.registerPlugin(ScrollTrigger);
        this.test();
        new Study();
    },
    methods: {
        test() {
            const horizontalWrapper = document.querySelector("[data-horizontal='wrapper']");
            const horizontalList = document.querySelector("[data-horizontal='list']");
            gsap.to(horizontalList, {
                x: () => -(horizontalList.clientWidth - horizontalWrapper.clientWidth),
                ease: 'none',
                scrollTrigger: {
                    trigger: '.js-study-trigger',
                    markers: true,
                    start: 'top top',
                    end: () => '+=' + (horizontalList.clientWidth - horizontalWrapper.clientWidth),
                    pin: true,
                    anticipatePin: 1, // 素早くスクロールしたときにピン留めが少し遅れ、ガタつくのを防ぐ。
                    invalidateOnRefresh: true, // リサイズに関係する
                    scrub: true,
                },
            });
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/_study';
</style>
