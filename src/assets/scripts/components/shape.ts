// import * as THREE from 'three';
// import Webgl from './webgl';

import EventBus from '~/utils/event-bus';

export default class Shape {
    constructor() {
        this.init();
    }
    init(): void {

        EventBus.$on('TRANSITION', this.onTransition.bind(this));
    }
    onTransition(path: string) {
        switch (path) {
            case 'mv':
                break;
            case 'index':

                break;
        }
    }
}
