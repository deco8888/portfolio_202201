<template>
    <div class="p-index-box" data-cursor-target>
        <div class="p-index-box__inner">
            <nuxt-link to="/about" class="p-index-box__link">
                <BaseImage :pcImg="'balloon.gif'" :alt="'about'" :width="500" :height="500" :decodingAsync="true" />
            </nuxt-link>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BaseImage from '~/components/common/BaseImage.vue';

export default Vue.extend({
    components: {
        BaseImage,
    },
    mounted() {
        // @ts-ignore
        this.$scrollFunction({
            selector: '[data-scroll]',
        });
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/parts/_box';
</style>
