<template>
    <canvas class="p-canvas" ref="canvas"></canvas>
</template>

<script lang="ts">
import Art from '~/assets/scripts/components/art';
import EventBus from '~/utils/event-bus';

import Vue from 'vue';
export default Vue.extend({
    data() {
        return {};
    },
    mounted() {
        const canvas = this.$refs.canvas as HTMLCanvasElement;
        const art = new Art({
            canvas: canvas,
        });
        console.log(this.$route.name);
        EventBus.$emit("TRANSITION", this.$route.name);
    },
    watch: {
        "$route.name": function(_new, _old) {
            console.log(_new);
            EventBus.$emit("TRANSITION", _new);
        }
    }
});
</script>
