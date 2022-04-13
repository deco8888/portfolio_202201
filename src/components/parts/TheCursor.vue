<template>
    <div class="c-cursor__wrap">
        <div class="c-cursor" data-cursor>
            <span></span>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Cursor } from '~/assets/scripts/components/cursor';

export default Vue.extend({
    mounted() {
        new Cursor();
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/parts/_cursor';
</style>
