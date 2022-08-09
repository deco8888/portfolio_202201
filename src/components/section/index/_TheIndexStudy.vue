<template>
    <section id="study" class="p-index-study">
        <div class="p-index-study__inner js-study-trigger">
            <div class="p-index-study__canvas" data-study="canvas"></div>
            <div class="p-index-study__wrap" data-horizontal="wrapper">
                <div class="p-index-study__list" data-horizontal="list">
                    <a
                        class="p-index-study__image-wrap p-index-study__image-wrap--image1"
                        href=""
                        target="_blank"
                        rel=""
                    >
                        <div
                            class="p-index-study__image"
                            data-study="image"
                            data-study-image="sakura.jpg"
                            data-study-title="No.1"
                            data-study-link="https://hatarakigai.info/project/"
                        ></div>
                    </a>
                    <a class="p-index-study__image-wrap p-index-study__image-wrap--image2">
                        <div
                            class="p-index-study__image"
                            data-study="image"
                            data-study-image="sakura.jpg"
                            data-study-title="No.2"
                            data-study-link="https://works.yuta-takahashi.dev/"
                        ></div>
                    </a>
                    <a class="p-index-study__image-wrap p-index-study__image-wrap--image3">
                        <div
                            class="p-index-study__image"
                            data-study="image"
                            data-study-image="sakura.jpg"
                            data-study-title="No.3"
                            data-study-link="https://nuxtjs.org/ja/docs/concepts/views/#layouts"
                        ></div>
                    </a>
                </div>
                <div class="p-index-study-expansion" data-expansion="wrapper">
                    <div class="p-index-study-expansion__inner">
                        <!-- <div
                            class="p-index-study-expansion__item p-index-study-expansion__item--front"
                            data-expansion="item"
                            data-cursor-target
                            @click="clickItem"
                        ></div> -->
                        <div
                            class="p-index-study-expansion__item p-index-study-expansion__item--back"
                            data-cursor-target
                            @click="clickItem"
                        >
                            <div
                                :class="['p-index-study-expansion__envelope-wrapper']"
                                data-envelope
                                data-cursor-target
                                @click="clickItem"
                            >
                                <div class="p-index-study-expansion__envelope-bg"></div>
                                <div class="p-index-study-expansion__envelope"></div>
                                <div class="p-index-study-expansion__envelope-opener" data-envelope-opener></div>
                                <div
                                    class="p-index-study-expansion__envelope-letter"
                                    data-envelope-letter
                                    data-expansion="item"
                                ></div>
                            </div>
                            <p class="p-index-study-expansion__text">CONTACT</p>
                        </div>
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
import { contactStore } from '~/store';
import { isMobile } from '~/assets/scripts/components/isMobile';
import EventBus from '~/utils/event-bus';

interface StudyOptions {
    study: Study;
    studyAnim: {
        [key: string]: number;
    };
    expansion: Expansion;
    title: Title;
    isActive: boolean;
    isMobile: boolean;
}

export default Vue.extend({
    components: {
        BaseImage,
        TheContact,
    },
    props: {
        isClose: {
            type: Boolean,
            required: false,
            default: false,
        },
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
            isActive: false,
            isMobile: isMobile(),
        };
    },
    watch: {
        isClose(val: boolean) {
            if (val) this.close();
        },
    },
    mounted() {
        // gsap.registerPlugin(ScrollTrigger);
        this.moveHorizontally();
        this.study = new Study();
        this.expansion = new Expansion();
        this.expansion.init();
        EventBus.$emit('SHOW', false);
        // document.querySelector('[data-envelope]').addEventListener('mouseover', () => {
        //     this.isActive = true;
        // });
        // document.querySelector('[data-envelope]').addEventListener('mouseleave', () => {
        //     this.isActive = false;
        // });
    },
    methods: {
        moveHorizontally() {
            const horizontalWrapper = document.querySelector("[data-horizontal='wrapper']");
            const horizontalList = document.querySelector("[data-horizontal='list']");
            const box = document.querySelector('[data-expansion="wrapper"]');
            const mvHeight = document.querySelector<HTMLElement>('[data-mv]').clientHeight;
            if (this.isMobile) {
                const scrollHeight = horizontalList.clientHeight - horizontalWrapper.clientHeight;
                gsap.to(horizontalList, {
                    y: () => -scrollHeight,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.js-study-trigger',
                        markers: true,
                        start: 'top top',
                        end: () => '+=' + scrollHeight,
                        onUpdate: () => {
                            if (scrollHeight < window.scrollY - mvHeight + 50) {
                                addClass(box, hasClass.active);
                            } else {
                                removeClass(box, hasClass.active);
                            }
                        },
                        pin: true,
                        anticipatePin: 1, // 素早くスクロールしたときにピン留めが少し遅れ、ガタつくのを防ぐ。
                        invalidateOnRefresh: true, // リサイズに関係する
                        scrub: true, // アニメーションをスクロール位置にリンクさせる
                    },
                });
            } else {
                const scrollWidth = horizontalList.clientWidth - horizontalWrapper.clientWidth;
                gsap.to(horizontalList, {
                    x: () => -scrollWidth,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.js-study-trigger',
                        markers: true,
                        start: 'top top',
                        end: () => '+=' + scrollWidth,
                        onUpdate: () => {
                            if (scrollWidth < window.scrollY - mvHeight + 50) {
                                addClass(box, hasClass.active);
                            } else {
                                removeClass(box, hasClass.active);
                            }
                        },
                        pin: true,
                        anticipatePin: 1, // 素早くスクロールしたときにピン留めが少し遅れ、ガタつくのを防ぐ。
                        invalidateOnRefresh: true, // リサイズに関係する
                        scrub: true, // アニメーションをスクロール位置にリンクさせる
                    },
                });
            }
        },
        async clickItem(): Promise<void> {
            await this.expansion.start();
            this.$emit('is-show', true);
            contactStore.setContactData({ isShow: true });
            EventBus.$emit('SHOW', true);
        },
        close(): void {
            this.expansion.close();
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/index/_study';
</style>
