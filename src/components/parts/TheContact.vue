<template>
    <transition name="fade">
        <div class="p-contact" v-show="isShow">
            <div class="p-contact__inner">
                <div class="p-contact__close" data-contact="close"></div>
                <div class="p-index-study__content">
                    <p>TEST TEST TEST</p>
                </div>
                <div class="p-contact__post" data-canvas="contact"></div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import Vue from 'vue';
import Expansion from '~/assets/scripts/components/expansion';
import Post from '~/assets/scripts/components/parts/contact/post';
import Title from '~/assets/scripts/components/parts/contact/title';

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
    } {
        return {
            expansion: null,
            title: null,
            post: null,
        };
    },
    async mounted() {
        const canvas = document.querySelector<HTMLElement>('[data-canvas="contact"]');
        this.post = new Post();
        await this.post.init(canvas);
    },
    watch: {
        isShow(val: boolean) {
            if (val) this.init();
        },
    },
    methods: {
        async init(): Promise<void> {
            this.post.setModels();
        },
        handleEvent(): void {
            window.addEventListener(
                'mousemove',
                (e: MouseEvent) => {
                    this.title.handleMove(e);
                },
                false
            );
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/parts/_contact';
</style>
