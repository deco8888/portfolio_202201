<template>
    <div :class="['p-index-balloon', { 'is-active': isShow }]" data-balloon>
        <!-- <div class="p-index-balloon__wrap"> -->
        <canvas class="p-index-balloon__canvas" data-canvas="balloon" ref="balloon"></canvas>
        <!-- </div> -->
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Balloon from '~/assets/scripts/components/parts/index/mv/balloon';

export default Vue.extend({
    props: {
        isShow: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data(): {
        balloon: Balloon;
        isOpen: boolean;
        canvas: HTMLCanvasElement;
    } {
        return {
            balloon: null,
            isOpen: false,
            canvas: null,
        };
    },
    watch: {
        isShow(val: boolean): void {
            if (val) this.init();
        },
    },
    async mounted() {
        this.canvas = this.$refs.balloon as HTMLCanvasElement;
        this.balloon = new Balloon();
        await this.balloon.init(this.canvas);
        // 画面遷移時に「cancelAnimationFrame」を実行
        this.$router.beforeEach(async (_to, _from, next) => {
            if (this.balloon) {
                this.balloon.removeModels();
                this.balloon = null;
            }
            next();
        });
    },
    methods: {
        async init(): Promise<void> {
            // this.title.isFirst = true;
            this.balloon.setModels();
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/parts/_balloon';
</style>
