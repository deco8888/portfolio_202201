import { Store } from 'vuex';
import { getModule } from 'vuex-module-decorators';
import Loading from '../store/loading';
import Contact from '../store/contact';

let loadingStore: Loading;
let contactStore: Contact;

function initializeStore(store: Store<any>): void {
    loadingStore = getModule(Loading, store);
    contactStore = getModule(Contact, store);
}

export { initializeStore, contactStore, loadingStore };
