import { Store } from 'vuex';
import { initializeStore } from '~/utils/store-accessor';

const initializer = (store: Store<any>) => initializeStore(store);

export const plugins = [initializer];
export * from '../utils/store-accessor';
