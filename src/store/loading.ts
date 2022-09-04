import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

type LoadingState = {
    loaded: boolean
}

@Module({
    name: "loading",
    stateFactory: true, // Nuxt.jsのモジュールであることを宣言
    namespaced: true
})
export default class Contact extends VuexModule {
    private loading: LoadingState = {
        loaded: false
    }

    public get getLoading() {
         return this.loading;
    }

    @Mutation
    private setLoading(loading: LoadingState) {
        this.loading = loading;
    }

    @Action
    public setLoadingData(loading: LoadingState): void {
        this.setLoading(loading);
    }
}
