<template>
    <div class="p-page">
        <!-- <TheIndex /> -->
        <div class="p-index-mv__canvas" data-canvas="title" data-title="mv"></div>
        <div class="p-index-study__expansion" data-expansion="canvas">
            <div class="p-index-study__expansion-canvas expansion" data-expansion="expansion"></div>
            <TheContact :isShow="this.flg.show" @is-close="close" />
        </div>
        <TheMv />
        <TheBox />
        <TheStudy @is-show="show" :isClose="this.flg.close" />
        <TheCursor />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TheBox from '~/components/parts/TheBox.vue';
import TheMv from '~/components/section/index/_TheIndexMv.vue';
import TheStudy from '~/components/section/index/_TheIndexStudy.vue';
import TheContact from '~/components/parts/TheContact.vue';
import TheCursor from '../components/parts/TheCursor.vue';
import BaseImage from '~/components/common/TheBaseImage.vue';
import Title from '~/assets/scripts/components/section/index/title';
import Attract from '~/assets/scripts/modules/attract';
import { debounce } from '~/assets/scripts/utils/debounce';

export default Vue.extend({
    head: {
        title: 'TOP',
    },
    data(): {
        title: Title;
        flg: {
            [key: string]: boolean;
        };
    } {
        return {
            title: null,
            flg: {
                scroll: true,
                show: false,
                close: false,
            },
        };
    },
    components: {
        TheBox,
        TheMv,
        TheStudy,
        TheContact,
        TheCursor,
        BaseImage,
    },
    mounted() {
        this.title = new Title();
        this.title.init();
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
                debounce(() => {
                    this.title.handleResize();
                }, 10),
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
        show(isShow: boolean): void {
            this.flg.show = isShow;
            this.flg.close = !isShow;
        },
        close(isClose: boolean): void {
            this.flg.close = isClose;
            this.flg.show = !isClose;
        },
    },
});
</script>
