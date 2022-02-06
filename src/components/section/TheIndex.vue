<template>
    <section class="p-index">
        <TheCanvas />
    </section>
</template>

<script lang="ts">
import Vue from 'vue';
import TheCanvas from '../common/TheCanvas.vue';

export default Vue.extend({
    components: {
        TheCanvas,
    },
});
</script>

<style>
.p-index {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #106280;
}
</style>
