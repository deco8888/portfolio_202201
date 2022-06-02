<template>
    <div class="p-about">
        <div class="p-about__canvas" data-canvas="title"> </div>
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

export default Vue.extend({
    components: {
        TheAboutIntro,
        TheAboutTransition,
    },
    data(): {
        title: Title;
    } {
        return {
            title: null,
        };
    },
    mounted(): void {
        this.title = new Title();
        setTimeout(() => {
            this.title.init();
            this.handleEvent();
        }, 1000);
        this.$router.beforeEach(async (_to, _from, next) => {
            await this.title.cancelAnimFrame();
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
