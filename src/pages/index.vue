<template>
    <div class="p-page">
        <TheIndex />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TheIndex from '~/components/section/TheIndex.vue';

export default Vue.extend({
    components: {
        TheIndex,
    },
});
</script>
