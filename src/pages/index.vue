<template>
    <div class="p-page">
        <!-- <TheIndex /> -->
        <canvas class="p-index-mv__canvas" data-canvas="title"> </canvas>
        <TheMv />
        <TheBox />
        <TheStudy />
        <TheCursor />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TheBox from '~/components/parts/TheBox.vue';
import TheMv from '~/components/section/index/_TheIndexMv.vue';
import TheStudy from '~/components/section/index/_TheIndexStudy.vue';
import TheCursor from '../components/parts/TheCursor.vue';
import TheLottie from '../components/parts/TheLottie.vue';
import BaseImage from '~/components/common/TheBaseImage.vue';

export default Vue.extend({
    head: {
        title: 'TOP',
    },
    data(): {
        routerChanging: Boolean;
    } {
        return {
            routerChanging: true,
        };
    },
    components: {
        TheBox,
        TheMv,
        TheStudy,
        TheCursor,
        TheLottie,
        BaseImage,
    },
    watch: {
        // routerChanging(newV) {
        //     console.log('newV : ' + newV);
        // },
    },
    mounted() {
        this.$router.beforeEach((to, from, next) => {
            this.routerChanging = true;
            // new Index().cancel();
            next();
        });

        // this.$router.afterEach(() => {
        //     document.querySelector('.p-page').scrollTop = 0;
        // });
    },
    methods: {
        // start() {
        //     new Study().init();
        // },
    },
});
</script>
