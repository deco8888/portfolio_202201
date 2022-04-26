// import * as THREE from 'three';
// import Webgl from './webgl';
// import Index from './index';

import EventBus from '~/utils/event-bus';
// import Index from '.';

export default class Common {
    // index: Index;
    constructor() {
        // this.index = new Index();
        this.init();
    }
    init(): void {
        EventBus.$on('TRANSITION', this.onTransition.bind(this));
    }
    onTransition(path: string) {
        switch (path) {
            case 'index':
                // this.index.init();
                break;
            case 'about':
                break;
        }
    }
}
