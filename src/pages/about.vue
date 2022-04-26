<template>
    <div class="p-about">
        <TheAboutTransition />
        <!-- <TheAboutIntro /> -->
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TheAboutIntro from '~/components/section/about/_TheAboutIntro.vue';
import TheAboutTransition from '~/components/section/about/_TheAboutTransition.vue';
// import EventBus from '~/utils/event-bus';

export default Vue.extend({
    components: {
        TheAboutIntro,
        TheAboutTransition,
    },
    mounted() {
        this.$router.beforeEach((to, from, next) => {
            next();
        });
        this.$router.afterEach(() => {
            console.log('afterEach');

            setTimeout(() => {}, 1000);
        });
    },
});
</script>
