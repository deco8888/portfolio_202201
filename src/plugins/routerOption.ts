import type { Plugin } from '@nuxt/types';

const routerOption: Plugin = async ({ app }, inject): Promise<void> => {
    const state = { routerChange: false };
    inject('routerChange', () => state.routerChange);

    app.router.beforeEach((_to, _from, next) => {
        // console.log('beforeEach');
        state.routerChange = true;
        next();
    });

    app.router.afterEach(() => {
        setTimeout(() => {
            // console.log('afterEach');
            state.routerChange = false;
        }, 100)
    });
};

export default routerOption;
