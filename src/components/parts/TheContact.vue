<template>
    <div class="p-contact" data-expansion="wrapper">
        <div class="p-contact__inner">
            <div class="p-contact__item" data-expansion="item" data-cursor-target @click="clickItem"></div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Expansion from '~/assets/scripts/components/expansion';
import Title from '~/assets/scripts/components/parts/contact/title';

export default Vue.extend({
    data(): {
        expansion: Expansion;
        title: Title;
    } {
        return {
            expansion: null,
            title: null,
        };
    },
    mounted() {},
    methods: {
        async clickItem(): Promise<void> {
            this.expansion = new Expansion();
            this.expansion.init();
            await this.expansion.start();
            this.title = new Title();
            this.title.init();
            this.handleEvent();
        },
        handleEvent(): void {
            // const path = this.$route.name;
            // window.addEventListener(
            //     'resize',
            //     debounce(() => {
            //         this.title.handleResize();
            //     }, 10),
            //     false
            // );
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
@import '~/assets/styles/components/parts/_contact';
</style>
