<template>
    <div class="p-index-contact">
        <div class="p-index-contact__title" data-title="contact"></div>
        <div class="p-index-contact__inner">
            <div
                :class="['p-index-contact__close', { 'is-open': isOpen }]"
                data-contact="close"
                data-attract
                @click="close()"
            >
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div :class="['p-index-contact__cloud', 'p-index-contact__cloud--cloud1', { 'is-open': isOpen }]">
                <BaseImage :pcImg="'cloud1.png'" :alt="''" :width="1419" :height="1020" :decodingAsync="true" />
            </div>
            <div :class="['p-index-contact__cloud', 'p-index-contact__cloud--cloud2', { 'is-open': isOpen }]">
                <BaseImage :pcImg="'cloud2.png'" :alt="''" :width="1530" :height="960" :decodingAsync="true" />
            </div>
            <div :class="['p-index-contact__cloud', 'p-index-contact__cloud--cloud3', { 'is-open': isOpen }]">
                <BaseImage :pcImg="'cloud3.png'" :alt="''" :width="1467" :height="1068" :decodingAsync="true" />
            </div>
            <div :class="['p-index-contact__cloud', 'p-index-contact__cloud--cloud4', { 'is-open': isOpen }]">
                <BaseImage :pcImg="'cloud1.png'" :alt="''" :width="1467" :height="1068" :decodingAsync="true" />
            </div>
            <div :class="['p-index-contact__cloud', 'p-index-contact__cloud--cloud5', { 'is-open': isOpen }]">
                <BaseImage :pcImg="'cloud2.png'" :alt="''" :width="1530" :height="960" :decodingAsync="true" />
            </div>
            <div class="p-index-contact__following" data-following>
                <BaseImage :pcImg="'message.png'" :alt="''" :width="984" :height="638" :decodingAsync="true" />
            </div>
            <div
                class="p-index-contact__post"
                @mouseenter="mouseenter()"
                @mouseleave="mouseleave()"
                data-post
                data-following-target
            >
                <a href="mailto:ayaka.nakamura0805@gmail.com">
                    <canvas class="p-index-contact__post-canvas" data-canvas="contact" ref="canvas"></canvas>
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BaseImage from '~/components/common/BaseImage.vue';
import Expansion from '~/assets/scripts/modules/expansion';
import Post from '~/assets/scripts/components/parts/index/contact/post';
import Title from '~/assets/scripts/components/parts/index/contact/title';
import Following from '~/assets/scripts/components/parts/index/contact/following';
import { addClass, removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';
import { contactStore } from '~/store';

export default Vue.extend({
    components: {
        BaseImage,
    },
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
        following: Following;
        isOpen: boolean;
        canvas: HTMLCanvasElement;
    } {
        return {
            expansion: null,
            title: null,
            post: null,
            following: null,
            isOpen: false,
            canvas: null,
        };
    },
    async mounted() {
        this.title = new Title();
        // this.title.isFirst = true;
        this.post = new Post();
        this.canvas = this.$refs.canvas as HTMLCanvasElement;
        await this.post.init(this.canvas);
        this.post.setModels();
        this.following = new Following();
        this.handleEvent();
        // 画面遷移時に「cancelAnimationFrame」を実行
        this.$router.beforeEach(async (_to, _from, next) => {
            if (this.title) {
                this.title.cancel();
                this.title = null;
            }
            if (this.post) {
                this.post.removeModels();
                this.post = null;
            }
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
                    if (this.post) this.post.handleResize();
                    if (this.title) this.title.handleResize();
                },
                false
            );
            window.addEventListener(
                'mousemove',
                (e: MouseEvent) => {
                    if (this.title) this.title.handleMove(e);
                    if (this.post && this.isOpen) this.post.handleMove(e);
                    if (this.following) this.following.handleMove(e);
                },
                false
            );
        },
        init(): void {
            this.isOpen = true;
            this.title.draw();
            this.title.render();
            this.following.render();
            setTimeout(() => {
                addClass(this.canvas, hasClass.active);
            }, 300);
        },
        close(): void {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
            });
            setTimeout(() => {
                removeClass(this.canvas, hasClass.active);
                this.title.removeTitle();
                this.following.cancel();
                this.isOpen = false;
                this.$emit('is-close', true);
                contactStore.setContactData({ isShow: false });
            }, 1000);
        },
        mouseenter(): void {
            if (this.following) this.following.enter();
        },
        mouseleave(): void {
            if (this.following) this.following.leave();
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/parts/_contact';
</style>
