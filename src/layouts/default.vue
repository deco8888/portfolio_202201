<template>
    <div class="l-default">
        <main class="l-main">
            <Nuxt />
        </main>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import EventBus from '~/utils/event-bus';

export default Vue.extend({
    watch: {
        '$route.name': function (_new, _old) {
            EventBus.$emit('TRANSITION', _new);
        },
    },
    mounted() {
        EventBus.$emit('TRANSITION', this.$route.name);
        EventBus.$on('TRANSITION', () => this.$route.name);
        window.addEventListener('resize', () => this.reload(), false);
    },
    methods: {
        reload(): void {
            this.$router.go(0);
        },
    },
});
</script>
