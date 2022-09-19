<template>
    <div class="p-about-transition" data-transition="wrapper">
        <div class="p-about-transition__canvas" data-transition="canvas"></div>
    </div>
</template>

<script lang="ts" scoped>
import Vue from 'vue';
import Transition from '~/assets/scripts/modules/transition';

export default Vue.extend({
    data(): {
        transition: Transition;
    } {
        return {
            transition: null,
        };
    },
    mounted() {
        this.transition = new Transition();
        this.transition.init();
        this.transition.start();
        this.handleEvent();
        // 画面遷移時に「cancelAnimationFrame」を実行
        this.$router.beforeEach(async (_to, _from, next) => {
            if (this.transition) {
                this.transition.dispose();
                this.transition = null;
            }
            next();
        });
    },
    methods: {
        handleEvent(): void {
            window.addEventListener(
                'resize',
                () => {
                    if (this.transition) this.transition.handleResize();
                },
                false
            );
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/about/_transition';
</style>
