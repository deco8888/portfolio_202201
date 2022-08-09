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
            <div class="p-index-study__content">
                <p>TEST TEST TEST</p>
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
import EventBus from '~/utils/event-bus';

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
        this.post = new Post();
        await this.post.init(this.canvas);
        this.post.setModels();
    },
    watch: {
        isShow(val: boolean) {
            if (val) this.init();
        },
    },
    methods: {
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
                // this.post.removeModels();
                removeClass(this.canvas, hasClass.active);
                this.title.removeTitle();
                this.isOpen = false;
                this.$emit('is-close', true);
                contactStore.setContactData({ isShow: false });
                EventBus.$emit('SHOW', false);
            }, 500);
        },
    },
});
</script>

<style lang="scss" scoped>
@import '~/assets/styles/components/parts/_contact';
</style>
