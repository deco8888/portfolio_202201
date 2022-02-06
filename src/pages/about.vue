<template>
    <div class="p-page">
        <TheIndex />
    </div>
</template>

<script lang="ts">
import TheIndex from '~/components/section/TheIndex.vue';

import Vue from 'vue';
export default Vue.extend({
    components: {
        TheIndex,
    },
});
</script>
