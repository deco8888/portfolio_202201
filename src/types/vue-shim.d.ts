declare module '*.vue' {
    import Vue from 'vue'
    export default Vue
}

declare module '@nuxt/types/config/runtime' {
    interface NuxtRuntimeConfig {
        url: string;
        baseUrl: string;
    }
}
