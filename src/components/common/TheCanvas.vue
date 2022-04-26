<template>
    <div ref="canvas" :class="`p-${sectionName}__canvas`"></div>
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
        // eslint-disable-next-line no-new
        new Art({
            canvas,
        });
        EventBus.$emit('TRANSITION', this.sectionName);
    },
});
</script>
