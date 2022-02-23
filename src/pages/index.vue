<template>
    <div class="p-page">
        <!-- <TheIndex /> -->
        <TheMv />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
// import TheIndex from '~/components/section/TheIndex.vue';
import TheMv from '~/components/section/TheMv.vue';

export default Vue.extend({
    components: {
        // TheIndex,
        TheMv
    },
});
</script>
