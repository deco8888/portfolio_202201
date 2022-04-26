<template>
    <div class="c-cursor" data-cursor>
        <span></span>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BaseImage from '~/components/common/TheBaseImage.vue';
import { Cursor } from '~/assets/scripts/components/cursor';

export default Vue.extend({
    components: {
        BaseImage,
    },
    mounted() {
        new Cursor();
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/parts/_cursor';
</style>
