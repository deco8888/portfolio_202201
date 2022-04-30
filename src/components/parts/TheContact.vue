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

export default Vue.extend({
    data(): {
        expansion: Expansion;
    } {
        return {
            expansion: null,
        };
    },
    mounted() {
        this.expansion = new Expansion();
        this.expansion.init();
    },
    methods: {
        async clickItem(): Promise<void> {
            await this.expansion.start();
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/parts/_contact';
</style>
