<template>
    <div class="l-default">
        <main class="l-main">
            <!-- <Loading ref="loading" />
            <div class="wrapper" ref="wrapper"> -->
            <Nuxt />
            <!-- <TheCursor />
            </div> -->
        </main>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
// import gsap, { Power4 } from 'gsap';
import EventBus from '~/utils/event-bus';
// import Loading from '~/components/Loading.vue';
// import TheCursor from '~/components/parts/TheCursor.vue';
// import { loadingStore } from '~/store';
// import { addClass, removeClass } from '~/assets/scripts/utils/classList';
// import { hasClass } from '~/assets/scripts/utils/hasClass';

export default Vue.extend({
    // components: {
    //     Loading,
    //     TheCursor,
    // },
    data() {
        return {
            isShow: false,
        };
    },
    watch: {
        '$route.name': function (_new, _old) {
            EventBus.$emit('TRANSITION', _new);
        },
    },
    mounted() {
        EventBus.$emit('TRANSITION', this.$route.name);
        EventBus.$on('TRANSITION', () => this.$route.name);
        // window.addEventListener('resize', () => this.reload(), false);
        // this.start();
        // this.$router.beforeEach(async (_to, _from, next) => {
        //     // loadingStore.setLoadingData({ loaded: false });
        //     // const loading = document.querySelector<HTMLElement>('.p-loading');
        //     // const block = document.querySelector<HTMLElement>('[data-loading-block]');
        //     // loading.style.display = 'block';
        //     // block.style.width = '';
        //     // block.style.height = '';
        //     // removeClass(document.body, hasClass.active);
        //     // this.isShow = false;
        //     // gsap.set(this.$refs.wrapper, {
        //     //     opacity: 0,
        //     // });
        //     next();
        // });
    },
});
</script>
