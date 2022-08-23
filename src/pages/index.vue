<template>
    <div class="p-page">
        <div class="p-index-mv__canvas" data-canvas="title" data-title="mv"></div>
        <div class="p-page__inner">
            <div class="p-index-study__expansion" data-expansion="canvas">
                <div class="p-index-study__expansion-canvas expansion" data-expansion="expansion"></div>
                <TheContact :isShow="this.contact.show" @is-close="closeContact" />
            </div>
            <TheMv />
            <TheCircle />
            <TheBox />
            <TheStudy @is-show="showContact" :isClose="this.contact.close" />
            <TheCursor />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TheCircle from '~/components/parts/TheCircle.vue';
import TheBox from '~/components/parts/TheBox.vue';
import TheMv from '~/components/section/index/_TheIndexMv.vue';
import TheStudy from '~/components/section/index/_TheIndexStudy.vue';
import TheContact from '~/components/parts/TheContact.vue';
import TheCursor from '../components/parts/TheCursor.vue';
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
            if (val) {
                this.title.startAnim();
            }
        },
    },
    computed: {
        loading(): boolean {
            return loadingStore.getLoading.loaded;
        },
    },
    async mounted() {
        this.title = new Title();
        await this.title.init();
        if (this.loading) this.title.startAnim();
        new Attract();
        this.handleEvent();
        this.$router.beforeEach(async (_to, _from, next) => {
            this.flg.scroll = false;
            await this.title.cancelAnimFrame();
            next();
        });
    },
    methods: {
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
