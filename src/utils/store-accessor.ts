import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';
import Contact from '../store/contact';

let contactStore: Contact;

function initializeStore(store: Store<any>): void {
    contactStore = getModule(Contact, store);
}

export { initializeStore, contactStore };
