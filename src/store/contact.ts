import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators';

type ContactState = {
    isShow: boolean
}

@Module({
    name: "contact",
    stateFactory: true, // Nuxt.jsのモジュールであることを宣言
    namespaced: true
})
export default class Contact extends VuexModule {
    private contact: ContactState = {
        isShow: false
    }

    public get getContact() {
         return this.contact;
    }

    @Mutation
    private setContact(contact: ContactState) {
        this.contact = contact;
    }

    @Action
    public setContactData(contact: ContactState): void {
        this.setContact(contact);
    }
}
