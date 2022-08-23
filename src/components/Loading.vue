<template>
    <section class="p-loading">
        <p>Loading</p>
        <div class="p-loading__block" data-loading-block>
            <div class="p-loading__block-inner">
                <span></span>
                <span></span>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    mounted() {
        // DOM更新をする非同期関数を全て実行した後に、第1引数として渡された関数を実行
        this.$nextTick(() => {
            // this.$nuxt.$loading.start();
            // setTimeout(() => this.$nuxt.$loading.finish(), 500);
        });
        window.addEventListener('load', () => {
            console.log('tick');
        });
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/_loading';
</style>
