<template>
    <div class="wrapper">
        <div class="p-page">
            <TheTransition ref="transition" />
            <TheAboutTransition />
            <div class="p-page__canvas" data-canvas="title" ref="canvas"></div>
            <TheAboutIntro />
            <TheAboutHouse :isShow="this.show" />
        </div>
        <TheCursor />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TheAboutIntro from '~/components/section/about/_TheAboutIntro.vue';
import TheAboutTransition from '~/components/section/about/_TheAboutTransition.vue';
import TheAboutHouse from '~/components/parts/about/TheAboutHouse.vue';
import TheCursor from '~/components/common/TheCursor.vue';
import TheTransition from '../components/common/TheTransition.vue';
import Title from '~/assets/scripts/components/section/about/title';
import { debounce } from '~/assets/scripts/utils/debounce';
import { removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';
import { loadingStore } from '~/store';

export default Vue.extend({
    components: {
        TheAboutIntro,
        TheAboutTransition,
        TheAboutHouse,
        TheTransition,
        TheCursor,
    },
    data(): {
        title: Title;
        show: boolean;
    } {
        return {
            title: null,
            show: false,
        };
    },
    mounted(): void {
        this.title = new Title();
        setTimeout(() => {
            this.title.init();
            this.handleEvent();
            this.show = true;
        }, 1500);
        const onTransition = this.$refs.transition as any;
        // 画面遷移時に「cancelAnimationFrame」を実行
        this.$router.beforeEach(async (_to, from, next) => {
            removeClass(document.body, hasClass.active);
            if (from.name === 'about') {
                await onTransition.start();
                this.cancel();
                next();
            } else {
                this.cancel();
                next();
            }
        });
    },
    methods: {
        handleEvent(): void {
            window.addEventListener(
                'resize',
                debounce(() => {
                    if (this.title) this.title.handleResize();
                }, 10),
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
        cancel(): void {
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
@import '~/assets/styles/pages/about.scss';
</style>
