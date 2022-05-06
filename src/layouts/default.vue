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
// import Common from '~/assets/scripts/components/common';

export default Vue.extend({
    watch: {
        '$route.name': function (_new, _old) {
            EventBus.$emit('TRANSITION', _new);
        },
    },
    mounted() {
        EventBus.$emit('TRANSITION', this.$route.name);
        EventBus.$on('TRANSITION', () => this.$route.name);
        // new Common();
    },
});
</script>
