<template>
    <div :class="['p-house', { 'is-active': isShow }]" data-house>
        <nuxt-link to="/" class="p-house__link">
            <canvas class="p-house__canvas" data-canvas="house" ref="house"></canvas>
        </nuxt-link>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import House from '~/assets/scripts/components/parts/about/house';

export default Vue.extend({
    props: {
        isShow: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data(): {
        house: House;
        isOpen: boolean;
        canvas: HTMLCanvasElement;
    } {
        return {
            house: null,
            isOpen: false,
            canvas: null,
        };
    },
    watch: {
        isShow(val: boolean): void {
            if (val) this.init();
        },
    },
    mounted() {
        // 画面遷移時に「cancelAnimationFrame」を実行
        this.$router.beforeEach(async (_to, _from, next) => {
            if (this.house) {
                this.house.removeModels();
                this.house = null;
            }
            next();
        });
    },
    methods: {
        async init(): Promise<void> {
            this.canvas = this.$refs.house as HTMLCanvasElement;
            // this.title.isFirst = true;
            this.house = new House();
            await this.house.init(this.canvas);
            this.house.setModels();
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/parts/_house';
</style>
