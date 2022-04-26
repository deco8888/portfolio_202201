import { Plugin } from '@nuxt/types';

declare module 'vue/types/vue' {
    interface Vue {
        $routerOption(): void;
    }
}

export class RouterOption {}

const routerOptionPlugin: Plugin = (_context, inject): void => {
    inject('routerOption', () => new RouterOption());
};

export default routerOptionPlugin;
