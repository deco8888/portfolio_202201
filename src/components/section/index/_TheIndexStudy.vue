<template>
    <section id="study" class="p-index-study" data-study>
        <div class="p-index-study__inner js-study-trigger">
            <div class="p-index-study__canvas" data-study="canvas"></div>
            <div class="p-index-study__wrap" data-horizontal="wrapper">
                <div class="p-index-study__list" data-horizontal="list">
                    <a
                        class="p-index-study__image-wrap p-index-study__image-wrap--image1"
                        href="https://hatarakigai.info/project/"
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
                        <div class="p-index-study-expansion__item" data-cursor-target @click="clickItem">
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
                            <p class="p-index-study-expansion__text" data-split="p-index-study-expansion">
                                <span
                                    v-for="(word, index) in 'CONTACT'.split('')"
                                    :key="index"
                                    class="p-index-study-expansion__char"
                                    data-split-char
                                >
                                    {{ word }}
                                </span>
                            </p>
                        </div>
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
import BaseImage from '~/components/common/TheBaseImage.vue';
import TheContact from '~/components/parts/TheContact.vue';
import Study from '~/assets/scripts/components/study';
import Expansion from '~/assets/scripts/components/expansion';
import Title from '~/assets/scripts/components/parts/contact/title';
import { addClass, removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';
import { contactStore, loadingStore } from '~/store';
import { isMobile } from '~/assets/scripts/components/isMobile';
import EventBus from '~/utils/event-bus';

interface StudyOptions {
    study: Study;
    studyAnim: {
        [key: string]: number;
    };
    elms: {
        [key: string]: HTMLElement;
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
            elms: {},
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
        loading(val: boolean) {
            if (val) this.init();
        },
        // elms(val: Pick<StudyOptions, 'elms'>) {
        //     const elmsList = Object.values(val);
        //     elmsList.forEach((elm, index) => {
        //         console.log(elm);
        //         if (!elm) return;
        //         if (elm && elmsList.length === index + 1) this.moveHorizontally();
        //     });
        // },
    },
    computed: {
        loading(): boolean {
            return loadingStore.getLoading.loaded;
        },
    },
    mounted() {
        if (this.loading) this.init();
        this.$router.beforeEach(async (_to, _from, next) => {
            console.log("photo");
            this.study.cancel();
            next();
        });
    },
    methods: {
        init(): void {
            console.log('study');
            gsap.registerPlugin(ScrollTrigger);
            setTimeout(() => {
                this.handleResize();
                this.moveHorizontally();
            }, 1000);
            this.study = new Study();
            this.expansion = new Expansion();
            this.expansion.init();
            this.splitText();
            EventBus.$emit('SHOW', false);
            window.addEventListener('resize', this.handleResize.bind(this));
        },
        moveHorizontally(): void {
            this.elms.horizontalList = document.querySelector("[data-horizontal='list']");
            const mvHeight = this.elms.mv.clientHeight;
            if (this.isMobile) {
                const scrollHeight = this.elms.horizontalList.clientHeight - this.elms.horizontalWrapper.clientHeight;
                gsap.to(this.elms.horizontalList, {
                    y: () => -scrollHeight,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.js-study-trigger',
                        markers: true,
                        start: 'top top',
                        end: () => '+=' + scrollHeight,
                        onUpdate: () => {
                            if (scrollHeight < window.scrollY - mvHeight + 50) {
                                addClass(this.elms.box, hasClass.active);
                            } else {
                                removeClass(this.elms.box, hasClass.active);
                            }
                        },
                        pin: true,
                        anticipatePin: 1, // 素早くスクロールしたときにピン留めが少し遅れ、ガタつくのを防ぐ。
                        invalidateOnRefresh: true, // リサイズに関係する
                        scrub: true, // アニメーションをスクロール位置にリンクさせる
                    },
                });
            } else {
                gsap.to(this.elms.horizontalList, {
                    x: () =>
                        -(
                            document.querySelector("[data-horizontal='list']").clientWidth -
                            this.elms.horizontalWrapper.clientWidth
                        ),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.js-study-trigger',
                        markers: true,
                        start: 'top top',
                        end: () =>
                            '+=' +
                            (document.querySelector("[data-horizontal='list']").clientWidth -
                                this.elms.horizontalWrapper.clientWidth),
                        onUpdate: () => {
                            if (
                                document.querySelector("[data-horizontal='list']").clientWidth -
                                    this.elms.horizontalWrapper.clientWidth <
                                window.scrollY - this.elms.mv.clientHeight + 50
                            ) {
                                addClass(this.elms.box, hasClass.active);
                            } else {
                                removeClass(this.elms.box, hasClass.active);
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
            addClass(document.body, hasClass.active);
            await this.expansion.start();
            this.$emit('is-show', true);
            contactStore.setContactData({ isShow: true });
        },
        close(): void {
            this.expansion.close();
        },
        handleResize(): void {
            this.expansion.handleResize();
            this.elms = {
                horizontalWrapper: document.querySelector("[data-horizontal='wrapper']"),
                horizontalLis: document.querySelector("[data-horizontal='list']"),
                box: document.querySelector('[data-expansion="wrapper"]'),
                mv: document.querySelector('[data-mv]'),
            };
        },
        splitText() {
            const charList = document.querySelectorAll<HTMLElement>('[data-split-char]');
            charList.forEach((char, index) => {
                char.style.animationDelay = `${index * 0.05 + 0.1}s`;
                char.style.setProperty('--char-index', `${index}`);
            });
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/index/_study';
</style>
