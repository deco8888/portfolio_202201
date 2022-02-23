<template>
    <canvas ref="canvas" :class="`p-${sectionName}__canvas`"></canvas>
</template>

<script lang="ts">
import Vue from 'vue';
import Art from '~/assets/scripts/components/art';
import EventBus from '~/utils/event-bus';

export default Vue.extend({
    props: {
        sectionName: { type: String, required: true },
    },
    data() {
        return {};
    },
    watch: {
        // eslint-disable-next-line vue/no-arrow-functions-in-watch
        sectionName: (_new, _old) => {
            EventBus.$emit('TRANSITION', _new);
        },
    },
    mounted() {
        const canvas = this.$refs.canvas as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');
        console.log(ctx);
        // eslint-disable-next-line no-new
        new Art({
            canvas,
            ctx,
        });
        EventBus.$emit('TRANSITION', this.sectionName);
    },
});
</script>
