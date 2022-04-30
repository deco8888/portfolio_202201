<template>
    <div class="p-box" data-cursor-target>
        <div class="p-box__inner">
            <nuxt-link to="/about">
                <BaseImage :pcImg="'balloon.gif'" :alt="'about'" :width="500" :height="500" :decodingAsync="true" />
            </nuxt-link>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BaseImage from '~/components/common/TheBaseImage.vue';

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
