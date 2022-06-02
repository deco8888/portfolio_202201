import type { Plugin } from '@nuxt/types';

const routerOption: Plugin = async ({ app }, inject): Promise<void> => {
    const state = { routerChange: false };
    inject('routerChange', () => state.routerChange);

    app.router.beforeEach((_to, _from, next) => {
        //
        state.routerChange = true;
        next();
    });

    app.router.afterEach(() => {
        setTimeout(() => {
            //
            state.routerChange = false;
        }, 100);
    });
};

export default routerOption;
