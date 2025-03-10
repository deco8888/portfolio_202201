<template>
    <div class="wrapper">
        <Loading ref="loading" @is-start="startLoading" />
        <div ref="wrapper" class="p-page">
            <TheTransition ref="transition" />
            <div class="p-page__canvas" data-canvas="title" data-title="mv"></div>
            <div class="p-page__expansion" data-expansion="canvas">
                <div class="p-page__expansion-canvas expansion" data-expansion="expansion"></div>
                <TheIndexContact :is-show="contact.show" @is-close="closeContact" />
            </div>
            <div ref="inner" class="p-page__inner">
                <TheIndexMv :is-active="mv.active" />
                <TheCircle />
                <TheIndexBox />
                <TheIndexStudy :is-close="contact.close" @is-show="showContact" />
            </div>
        </div>
        <TheCursor />
        <div class="address"></div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gsap, { Power4 } from 'gsap';
import TheCursor from '../components/common/TheCursor.vue';
import TheTransition from '../components/common/TheTransition.vue';
import Loading from '~/components/Loading.vue';
import TheCircle from '~/components/parts/index/TheIndexCircle.vue';
import TheIndexBox from '~/components/parts/index/TheIndexBox.vue';
import TheIndexMv from '~/components/section/index/_TheIndexMv.vue';
import TheIndexStudy from '~/components/section/index/_TheIndexStudy.vue';
import TheIndexContact from '~/components/parts/index/TheIndexContact.vue';
import Title from '~/assets/scripts/components/section/index/title';
import Attract from '~/assets/scripts/modules/attract';
import { addClass, removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';
import { loadingStore } from '~/store';
import { isMobile } from '~/assets/scripts/modules/isMobile';

export default Vue.extend({
    components: {
        Loading,
        TheCircle,
        TheIndexBox,
        TheIndexMv,
        TheIndexStudy,
        TheIndexContact,
        TheCursor,
        TheTransition,
    },
    data(): {
        title: Title;
        isMobile: boolean;
        flg: {
            [key: string]: boolean;
        };
        mv: {
            [key: string]: boolean;
        };
        circle: {
            [key: string]: boolean;
        };
        contact: {
            [key: string]: boolean;
        };
    } {
        return {
            title: null,
            isMobile: isMobile(),
            flg: {
                scroll: true,
                start: false,
            },
            mv: {
                active: false,
            },
            circle: {
                show: false,
                close: false,
            },
            contact: {
                show: false,
                close: false,
            },
        };
    },
    head: {
        title: 'TOP',
    },
    computed: {
        loading(): boolean {
            return loadingStore.getLoading.loaded;
        },
    },
    watch: {
        loading(val: boolean) {
            if (val) this.title.startAnim();
        },
        'flg.start' (val: boolean) {
            if (val) this.start();
        },
    },
    async mounted() {
        this.title = new Title();
        await this.title.init();
        // eslint-disable-next-line no-new
        new Attract();
        this.handleEvent();
        const onTransition = this.$refs.transition as any;
        // 画面遷移時に「cancelAnimationFrame」を実行
        this.$router.beforeEach(async (_to, from, next) => {
            removeClass(document.body, hasClass.active);
            if (from.name === 'index') {
                await onTransition.start();
                this.cancel();
                next();
            } else {
                this.cancel();
                next();
            }
        });
        // const diff = window.innerHeight - document.documentElement.clientHeight;
        // console.log({ diff });
        // document.querySelector<HTMLElement>('.address').style.height = `${diff}px`;
    },
    methods: {
        start(): void {
            const tl = gsap.timeline({
                paused: true,
                ease: Power4.easeOut,
            });
            tl.to('[data-loading-block]', {
                duration: 0.5,
                width: window.innerWidth,
                height: window.innerHeight,
            });
            tl.to(this.$refs.loading, {
                duration: 0.3,
                opacity: 0,
                onComplete: () => {
                    const loading = document.querySelector<HTMLElement>('.p-loading');
                    loading.style.display = 'none';
                    addClass(document.body, hasClass.active);
                    this.mv.active = true;
                },
            });
            tl.to(
                this.$refs.wrapper,
                {
                    duration: 0.3,
                    opacity: 1,
                    onComplete: () => {
                        loadingStore.setLoadingData({ loaded: true });
                    },
                },
                '<'
            );
            tl.play();
        },
        handleEvent(): void {
            const path = this.$route.name;
            document.querySelector('.p-page__inner').addEventListener('scroll', () => {
                if (this.title) this.title.handleScroll();
            });
            window.addEventListener(
                'scroll',
                () => {
                    if (path === 'index' && this.flg.scroll) {
                        if (this.title) this.title.handleScroll();
                    }
                },
                {
                    capture: false,
                    passive: true,
                }
            );
            window.addEventListener(
                'resize',
                () => {
                    if (this.title) this.title.handleResize();
                    // const diff = window.innerHeight - document.documentElement.clientHeight;
                    // console.log({ diff });
                    // document.querySelector<HTMLElement>('.address').style.height = `${diff}px`;
                },
                false
            );
            window.addEventListener(
                'mousemove',
                (e: MouseEvent) => {
                    if (this.title) this.title.handleMove(e);
                },
                false
            );
        },
        startLoading(isStart: boolean) {
            this.flg.start = isStart;
        },
        showCircle(isShow: boolean): void {
            this.circle.show = isShow;
            this.circle.close = !isShow;
        },
        showContact(isShow: boolean): void {
            this.contact.show = isShow;
            this.contact.close = !isShow;
        },
        closeContact(isClose: boolean): void {
            this.contact.close = isClose;
            this.contact.show = !isClose;
        },
        cancel(): void {
            this.flg.scroll = false;
            if (this.title) {
                this.title.cancel();
                this.title = null;
            }
            loadingStore.setLoadingData({ loaded: false });
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/pages/index.scss';
</style>
