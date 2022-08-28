<template>
    <!-- <transition name="fade"> -->
    <div class="p-contact">
        <div class="p-contact__inner">
            <div
                :class="['p-contact__close', { 'is-open': isOpen }]"
                data-contact="close"
                data-attract
                @click="close()"
            >
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="p-contact__post" data-canvas="contact"></div>
        </div>
    </div>
    <!-- </transition> -->
</template>

<script lang="ts">
import Vue from 'vue';
import Expansion from '~/assets/scripts/components/expansion';
import Post from '~/assets/scripts/components/parts/contact/post';
import Title from '~/assets/scripts/components/parts/contact/title';
import { addClass, removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';
import { contactStore } from '~/store';

export default Vue.extend({
    props: {
        isShow: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data(): {
        expansion: Expansion;
        title: Title;
        post: Post;
        isOpen: boolean;
        canvas: HTMLElement;
    } {
        return {
            expansion: null,
            title: null,
            post: null,
            isOpen: false,
            canvas: null,
        };
    },
    async mounted() {
        this.canvas = document.querySelector('[data-canvas="contact"]');
        this.title = new Title();
        // this.title.isFirst = true;
        this.post = new Post();
        await this.post.init(this.canvas);
        this.post.setModels();
        this.handleEvent();
        // 画面遷移時に「cancelAnimationFrame」を実行
        this.$router.beforeEach(async (_to, _from, next) => {
            this.title.cancel();
            this.post.removeModels();
            next();
        });
    },
    watch: {
        isShow(val: boolean) {
            if (val) this.init();
        },
    },
    methods: {
        handleEvent(): void {
            window.addEventListener(
                'resize',
                () => {
                    this.post.handleResize();
                    this.title.handleResize();
                },
                false
            );
            window.addEventListener(
                'mousemove',
                (e: MouseEvent) => {
                    this.title.handleMove(e);
                },
                false
            );
        },
        init(): void {
            this.isOpen = true;
            this.title.draw();
            this.title.render();
            setTimeout(() => {
                addClass(this.canvas, hasClass.active);
            }, 300);
        },
        close(): void {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth',
            });
            setTimeout(() => {
                removeClass(this.canvas, hasClass.active);
                this.title.removeTitle();
                this.isOpen = false;
                this.$emit('is-close', true);
                contactStore.setContactData({ isShow: false });
            }, 500);
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/parts/_contact';
</style>
