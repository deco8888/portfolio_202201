<template>
    <section id="study" class="p-index-study" data-study data-scroll>
        <div class="p-index-study__inner js-study-trigger">
            <div class="p-index-study__canvas" data-study="canvas"></div>
            <div class="p-index-study__wrap" data-horizontal="wrapper" ref="horizontalWrapper">
                <div class="p-index-study__list" data-horizontal="list" ref="horizontalList">
                    <a
                        class="p-index-study__image-wrap p-index-study__image-wrap--image1"
                        target="_blank"
                        rel=""
                        @mouseenter="mouseenter($event, 0.0)"
                        @mouseleave="mouseleave($event, 0.02)"
                        data-study="link"
                        data-study-title="No.1"
                    >
                        <div
                            class="p-index-study__image"
                            data-study="image"
                            data-study-image="comingsoon.jpg"
                            data-study-link="https://hatarakigai.info/project/"
                        ></div>
                    </a>
                    <a
                        class="p-index-study__image-wrap p-index-study__image-wrap--image2"
                        @mouseenter="mouseenter($event, 0.0)"
                        @mouseleave="mouseleave($event, 0.02)"
                        data-study="link"
                        data-study-title="No.2"
                    >
                        <div
                            class="p-index-study__image"
                            data-study="image"
                            data-study-image="comingsoon.jpg"
                            data-study-link="https://works.yuta-takahashi.dev/"
                        ></div>
                    </a>
                    <a
                        class="p-index-study__image-wrap p-index-study__image-wrap--image3"
                        @mouseenter="mouseenter($event, 0.0)"
                        @mouseleave="mouseleave($event, 0.02)"
                        data-study="link"
                        data-study-title="No.3"
                    >
                        <div
                            class="p-index-study__image"
                            data-study="image"
                            data-study-image="comingsoon.jpg"
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
                                    data-split-char="contact"
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
import Expansion from '~/assets/scripts/modules/expansion';
import Title from '~/assets/scripts/components/parts/index/contact/title';
import Photo from '~/assets/scripts/components/parts/index/study/photos';
import { addClass, removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';
import { loadingStore } from '~/store';
import { isMobile } from '~/assets/scripts/modules/isMobile';
import EventBus from '~/utils/event-bus';

interface StudyOptions {
    photo: Photo;
    studyAnim: {
        [key: string]: number;
    };
    elms: {
        [key: string]: HTMLElement;
    };
    expansion: Expansion;
    title: Title;
    scrollTrigger: gsap.core.Tween;
    timeline: gsap.core.Tween;
    isActive: boolean;
    isMobile: boolean;
    hoverFlg: boolean;
}

export default Vue.extend({
    props: {
        isClose: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data(): StudyOptions {
        return {
            photo: null,
            studyAnim: {
                previous: 0,
                current: 0,
                ease: 0.1,
            },
            elms: {},
            expansion: null,
            title: null,
            scrollTrigger: null,
            timeline: null,
            isActive: false,
            isMobile: isMobile(),
            hoverFlg: false,
        };
    },
    computed: {
        loading(): boolean {
            return loadingStore.getLoading.loaded;
        },
        getTitle() {
            return (event: MouseEvent): string => {
                const target = event.target as HTMLElement;
                return target.getAttribute('data-study-title');
            };
        },
    },
    watch: {
        isClose(val: boolean) {
            if (val) this.close();
        },
        loading(val: boolean) {
            if (val) this.init();
        },
    },
    mounted() {
        if (this.loading) this.init();
        // 画面遷移時に「cancelAnimationFrame」を実行
        // eslint-disable-next-line require-await
        this.$router.beforeEach(async (_to, _from, next) => {
            if (this.photo) {
                this.photo.cancelAnimFrame();
                this.photo = null;
            }
            if (this.scrollTrigger) {
                this.scrollTrigger.pause();
                this.scrollTrigger.kill();
                this.scrollTrigger = null;
            }
            if (this.expansion) {
                this.expansion.dispose();
                this.expansion = null;
            }
            next();
        });
    },
    methods: {
        init(): void {
            // console.log(document.querySelector('[data-study="canvas"]'));
            // スクロールトリガー
            // if (!this.isMobile) gsap.registerPlugin(ScrollTrigger);
            setTimeout(() => {
                this.handleResize();
                this.moveHorizontally();
            }, 1000);
            this.photo = new Photo();
            // if (!this.isMobile) this.photo = new Photo();

            window.addEventListener(
                'resize',
                () => {
                    if (this.photo) this.photo.handleResize();
                },
                false
            );
            window.addEventListener(
                'scroll',
                () => {
                    if (this.photo) this.photo.handleScroll();
                },
                {
                    capture: false,
                    passive: true,
                }
            );

            // 「Contact」の背景拡張
            this.expansion = new Expansion();
            this.expansion.init();
            // 1文字に切り分ける
            this.splitText();
            EventBus.$emit('SHOW', false);
            window.addEventListener('resize', () => {
                if (this.expansion) this.handleResize();
            });
        },
        moveHorizontally(): void {
            this.elms.horizontalList = document.querySelector("[data-horizontal='list']");
            // const mvHeight = this.elms.mv.clientHeight;
            if (!this.isMobile) {
                this.scrollTrigger = gsap.to(this.elms.horizontalList, {
                    x: () =>
                        -(
                            document.querySelector("[data-horizontal='list']").clientWidth -
                            this.elms.horizontalWrapper.clientWidth
                        ),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.js-study-trigger',
                        // markers: true,
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
        },
        close(): void {
            this.expansion.close();
        },
        handleResize(): void {
            this.expansion.handleResize();
            if (!this.isMobile) {
                this.elms = {
                    horizontalWrapper: document.querySelector("[data-horizontal='wrapper']"),
                    horizontalLis: document.querySelector("[data-horizontal='list']"),
                    box: document.querySelector('[data-expansion="wrapper"]'),
                    mv: document.querySelector('[data-mv]'),
                };
            }
        },
        splitText() {
            const charList = document.querySelectorAll<HTMLElement>('[data-split-char="contact"]');
            charList.forEach((char, index) => {
                char.style.animationDelay = `${index * 0.05 + 0}s`;
                char.style.setProperty('--char-index', `${index}`);
            });
        },
        mouseenter(e: MouseEvent, mozSize: number): void {
            if (this.timeline && !this.hoverFlg) this.timeline.pause();
            this.hoverFlg = true;
            const title = this.getTitle(e);
            this.changeMoz(title, 1, mozSize);
        },
        mouseleave(e: MouseEvent, mozSize: number): void {
            if (this.timeline && this.hoverFlg) this.timeline.pause();
            this.hoverFlg = false;
            const title = this.getTitle(e);
            this.changeMoz(title, 0.3, mozSize);
        },
        changeMoz(title: string, duration: number, value: number): void {
            for (const mesh of Object.values(this.photo.meshList)) {
                const material = this.photo.getMaterial(mesh);
                if (mesh.userData.title === title) {
                    this.timeline = gsap.to(material.uniforms.uMoz, {
                        duration,
                        delay: 0,
                        value,
                    });
                }
            }
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/index/_study';
</style>
