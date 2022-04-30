<template>
    <div class="p-about">
        <canvas class="p-index-mv__canvas" data-canvas="title"> </canvas>
        <TheAboutTransition />
        <TheAboutIntro />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Title from '~/assets/scripts/components/section/about/title';
import { debounce } from '~/assets/scripts/utils/debounce';
import TheAboutIntro from '~/components/section/about/_TheAboutIntro.vue';
import TheAboutTransition from '~/components/section/about/_TheAboutTransition.vue';
// import EventBus from '~/utils/event-bus';

export default Vue.extend({
    components: {
        TheAboutIntro,
        TheAboutTransition,
    },
    data() {
        return {
            title: null,
        };
    },
    mounted() {
        this.title = new Title();
        setTimeout(() => {
            this.title.init();
            this.handleEvent();
        }, 1000);
        this.$router.beforeEach((to, from, next) => {
            this.title.cancelAnimFrame();
            next();
        });
    },
    methods: {
        handleEvent(): void {
            const path = this.$route.name;
            window.addEventListener(
                'scroll',
                () => {
                    if (path === 'about') this.title.handleScroll();
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
