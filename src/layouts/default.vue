<template>
    <div class="l-default">
        <main class="l-main">
            <Nuxt />
        </main>
        <div class="l-sp">
            <div class="l-sp__wrap">
                <div :class="['l-sp__balloon', { 'is-active': isActive }]">
                    <canvas
                        ref="balloon"
                        class="l-sp__balloon-canvas"
                        data-canvas="balloon"
                        :data-balloon="'purple'"
                    ></canvas>
                </div>
                <div class="l-sp__text-wrap">
                    <p :class="['l-sp__text', { 'is-active': isActive }]">
                        <span
                            v-for="(word, index) in splitWord()"
                            :key="index"
                            :class="['l-sp__text-char', { blank: isBlank(word) }]"
                            data-split-char
                        >
                            {{ word }}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Balloon from '~/assets/scripts/components/parts/index/mv/balloon';
import { isMobile } from '~/assets/scripts/modules/isMobile';
import EventBus from '~/utils/event-bus';

export default Vue.extend({
    data(): {
        isShow: boolean;
        isActive: boolean;
        isMobile: boolean;
        balloon: Balloon;
        isOpen: boolean;
        canvas: HTMLCanvasElement;
        displayText: string;
    } {
        return {
            isShow: false,
            isActive: false,
            isMobile: isMobile(),
            balloon: null,
            isOpen: false,
            canvas: null,
            displayText: "Sorry, can't see this site in SP.",
        };
    },
    watch: {
        '$route.name'(_new, _old) {
            EventBus.$emit('TRANSITION', _new);
        },
    },
    async mounted() {
        EventBus.$emit('TRANSITION', this.$route.name);
        EventBus.$on('TRANSITION', () => this.$route.name);
        this.isShow = !this.isMobile;
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
        window.addEventListener(
            'resize',
            () => {
                const isSp = this.isMobile;
                this.isMobile = isMobile();
                if (isSp !== this.isMobile) {
                    const n = { path: this.$router.currentRoute.path, force: true } as unknown as number;
                    this.$router.go(n);
                }
            },
            false
        );
        if (this.isMobile) {
            this.canvas = this.$refs.balloon as HTMLCanvasElement;
            this.balloon = new Balloon();
            await this.balloon.init(this.canvas);
            this.init();
            // 画面遷移時に「cancelAnimationFrame」を実行
            this.$router.beforeEach((_to, _from, next) => {
                if (this.balloon) {
                    this.balloon.removeModels();
                    this.balloon = null;
                }
                next();
            });
        }
    },
    methods: {
        // eslint-disable-next-line require-await
        async init(): Promise<void> {
            // this.title.isFirst = true;
            this.balloon.setModels();
            this.isActive = true;
            this.splitText();
        },
        splitText(): void {
            const charList = document.querySelectorAll<HTMLElement>(`[data-split-char]`);
            charList.forEach((char, index) => {
                char.style.animationDelay = `${index * 0.04 + 0.3}s`;
                char.style.setProperty('--char-index', `${index}`);
            });
        },
        splitWord(): string[] {
            const words = this.displayText.split('');
            const result = [];
            for (const word of words) {
                if (word.match(/ /)) {
                    result.push("<span class='l-sp__char blank'></span>");
                } else {
                    result.push(word);
                }
            }
            console.log({ result });
            return words;
        },
        isBlank(char: string) {
            return !!char.match(/ /);
        },
    },
});
</script>
