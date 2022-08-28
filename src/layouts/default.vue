<template>
    <div class="l-default">
        <main class="l-main">
            <Loading ref="loading" />
            <div class="wrapper" ref="wrapper">
                <Nuxt />
                <TheCursor />
            </div>
        </main>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import gsap, { Power4 } from 'gsap';
import EventBus from '~/utils/event-bus';
import Loading from '~/components/Loading.vue';
import TheCursor from '~/components/parts/TheCursor.vue';
import { loadingStore } from '~/store';
import { addClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';

export default Vue.extend({
    components: {
        Loading,
        TheCursor,
    },
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
        this.start();
    },
    methods: {
        start(): void {
            const tl = gsap.timeline({
                paused: true,
                ease: Power4.easeOut,
            });
            tl.to(
                '[data-loading-block]',
                {
                    duration: 0.5,
                    width: window.innerWidth,
                    height: window.innerHeight,
                },
                2
            );
            tl.to(this.$refs.loading, {
                duration: 0.3,
                opacity: 0,
                onStart(): void {
                    console.log('2');
                },
                onComplete: () => {
                    const loading = document.querySelector<HTMLElement>('.p-loading');
                    loading.style.display = 'none';
                    addClass(document.body, hasClass.active);
                    this.isShow = true;
                },
            });
            tl.to(
                this.$refs.wrapper,
                {
                    duration: 0.3,
                    opacity: 1,
                    onStart(): void {
                        console.log('3');
                    },
                    onComplete: () => {
                        loadingStore.setLoadingData({ loaded: true });
                    },
                },
                '<'
            );
            tl.play();
        },
    },
});
</script>
