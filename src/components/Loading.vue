<template>
    <section class="p-loading">
        <div class="p-loading__block" data-loading-block>
            <div class="p-loading__block-inner">
                <span
                    :class="['p-loading__line', 'p-loading__line--top', { 'is-active': isActive }]"
                    data-loading-line="top"
                ></span>
                <span
                    :class="['p-loading__line', 'p-loading__line--bottom', { 'is-active': isActive }]"
                    data-loading-line="bottom"
                ></span>
                <!-- <span class="p-loading__line p-loading__line--bottom" data-loading-line="bottom"></span> -->
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import Vue from 'vue';
import gsap, { Power4 } from 'gsap';
import { removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';

export default Vue.extend({
    data() {
        return {
            isActive: false,
        };
    },
    mounted() {
        // DOM更新をする非同期関数を全て実行した後に、第1引数として渡された関数を実行
        // this.$nextTick(() => {
        //     removeClass(document.body, hasClass.active);
        //     this.start();
        // });
        removeClass(document.body, hasClass.active);
            this.start();
    },
    methods: {
        start(): void {
            const tl = gsap.timeline({
                paused: true,
                ease: Power4.easeOut,
            });
            tl.to(
                '[data-loading-line="top"]',
                {
                    duration: 1,
                    rotate: '180deg',
                    onComplete: () => {
                        this.isActive = true;
                    },
                },
                0.5
            );
            tl.set('[data-loading-line="top"]', {
                zIndex: 3,
            });
            tl.to('[data-loading-line="bottom"]', {
                duration: 1,
                rotate: '180deg',
                onComplete: () => {
                    this.$emit('is-start', true);
                },
            });
            tl.play();
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/_loading';
</style>
