<template>
    <div class="p-page">
        <!-- <TheIndex /> -->
        <canvas class="p-mv__canvas"></canvas>
        <TheMv />
        <TheStudy />
        <TheCursor />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
// import TheIndex from '~/components/section/TheIndex.vue';
import TheMv from '~/components/section/TheMv.vue';
import TheStudy from '~/components/section/TheStudy.vue';
import TheCursor from '../components/parts/TheCursor.vue';

export default Vue.extend({
    components: {
        // TheIndex,
        TheMv,
        TheStudy,
        TheCursor,
    },
});
</script>
