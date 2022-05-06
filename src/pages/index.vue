<template>
    <div class="p-page">
        <!-- <TheIndex /> -->
        <div class="p-index-mv__canvas" data-canvas="title"></div>
        <div class="p-index-study__expansion" data-expansion="canvas">
            <div class="p-index-study__expansion-canvas expansion" data-expansion="expansion"></div>
            <div class="p-index-study__content">
                <p>TEST</p>
            </div>
        </div>
        <TheMv />
        <TheBox />
        <TheStudy />
        <TheCursor />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TheBox from '~/components/parts/TheBox.vue';
import TheMv from '~/components/section/index/_TheIndexMv.vue';
import TheStudy from '~/components/section/index/_TheIndexStudy.vue';
import TheCursor from '../components/parts/TheCursor.vue';
import BaseImage from '~/components/common/TheBaseImage.vue';
import Title from '~/assets/scripts/components/section/index/title';
import { debounce } from '~/assets/scripts/utils/debounce';

export default Vue.extend({
    head: {
        title: 'TOP',
    },
    data(): {
        title: Title;
        scrollFlg: boolean;
    } {
        return {
            title: null,
            scrollFlg: true,
        };
    },
    components: {
        TheBox,
        TheMv,
        TheStudy,
        TheCursor,
        BaseImage,
    },
    mounted() {
        setTimeout(() => {
            this.title = new Title();
            this.title.init();
            this.handleEvent();
        }, 100);
        this.$router.beforeEach(async (_to, _from, next) => {
            this.scrollFlg = false;
            await this.title.cancelAnimFrame(true);
            next();
        });
    },
    methods: {
        handleEvent(): void {
            const path = this.$route.name;
            window.addEventListener(
                'scroll',
                () => {
                    if (path === 'index' && this.scrollFlg) {
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
    },
});
</script>
