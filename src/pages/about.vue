<template>
    <div class="wrapper">
        <div class="p-about">
            <div class="p-about__canvas" data-canvas="title" ref="canvas"></div>
            <TheAboutTransition />
            <TheAboutIntro />
            <TheHouse :isShow="this.show" />
        </div>
        <TheCursor />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Title from '~/assets/scripts/components/section/about/title';
import TheAboutIntro from '~/components/section/about/_TheAboutIntro.vue';
import TheAboutTransition from '~/components/section/about/_TheAboutTransition.vue';
import TheCursor from '~/components/parts/common/TheCursor.vue';
import TheHouse from '~/components/parts/about/TheHouse.vue';
import { debounce } from '~/assets/scripts/utils/debounce';

export default Vue.extend({
    components: {
        TheAboutIntro,
        TheAboutTransition,
        TheCursor,
        TheHouse,
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
        // 画面遷移時に「cancelAnimationFrame」を実行
        this.$router.beforeEach(async (_to, _from, next) => {
            await this.title.cancel();
            next();
        });
    },
    methods: {
        handleEvent(): void {
            const path = this.$route.name;
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

<style lang="scss" scoped>
@import '~/assets/styles/pages/about.scss';
</style>
