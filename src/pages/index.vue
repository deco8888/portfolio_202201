<template>
    <div class="wrapper">
        <Loading ref="loading" @is-start="startLoading" />
        <div class="p-page" ref="wrapper">
            <div class="p-index-mv__canvas" data-canvas="title" data-title="mv"></div>
            <div class="p-page__inner">
                <div class="p-index-study__expansion" data-expansion="canvas">
                    <div class="p-index-study__expansion-canvas expansion" data-expansion="expansion"></div>
                    <TheContact :isShow="this.contact.show" @is-close="closeContact" />
                </div>
                <TheMv :isActive="this.mv.active" />
                <TheCircle />
                <TheBox />
                <TheStudy @is-show="showContact" :isClose="this.contact.close" />
            </div>
        </div>
        <TheCursor />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gsap, { Power4 } from 'gsap';
// import EventBus from '~/utils/event-bus';
import Loading from '~/components/Loading.vue';
import { addClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';
import TheCircle from '~/components/parts/index/TheCircle.vue';
import TheBox from '~/components/parts/index/TheBox.vue';
import TheMv from '~/components/section/index/_TheIndexMv.vue';
import TheStudy from '~/components/section/index/_TheIndexStudy.vue';
import TheContact from '~/components/parts/index/TheContact.vue';
import TheCursor from '../components/parts/common/TheCursor.vue';
import BaseImage from '~/components/common/TheBaseImage.vue';
import Title from '~/assets/scripts/components/section/index/title';
import Attract from '~/assets/scripts/modules/attract';
import { loadingStore } from '~/store';

export default Vue.extend({
    head: {
        title: 'TOP',
    },
    data(): {
        title: Title;
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
    components: {
        Loading,
        TheCircle,
        TheBox,
        TheMv,
        TheStudy,
        TheContact,
        TheCursor,
        BaseImage,
    },
    watch: {
        loading(val: boolean) {
            if (val) this.title.startAnim();
        },
        'flg.start': function (val: boolean) {
            if (val) this.start();
        },
    },
    computed: {
        loading(): boolean {
            return loadingStore.getLoading.loaded;
        },
    },
    async mounted() {
        // this.start();
        this.title = new Title();
        await this.title.init();
        // if (this.loading) this.title.startAnim();
        new Attract();
        this.handleEvent();
        // 画面遷移時に「cancelAnimationFrame」を実行
        this.$router.beforeEach(async (_to, _from, next) => {
            this.flg.scroll = false;
            await this.title.cancel();
            loadingStore.setLoadingData({ loaded: false });
            next();
        });
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
            window.addEventListener(
                'scroll',
                () => {
                    if (path === 'index' && this.flg.scroll) {
                        this.title.handleScroll();
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
                    this.title.handleResize();
                },
                false
            );
            window.addEventListener(
                'mousemove',
                (e: MouseEvent) => {
                    this.title.handleMove(e);
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
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/pages/index.scss';
</style>
