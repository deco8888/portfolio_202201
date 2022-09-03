<template>
    <div class="p-about-transition" data-transition="wrapper">
        <div class="p-about-transition__canvas" data-transition="canvas"></div>
    </div>
</template>

<script lang="ts">
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
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/sections/about/_transition';
</style>
