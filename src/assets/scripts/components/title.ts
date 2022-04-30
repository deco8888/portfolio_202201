import EventBus from '~/utils/event-bus';
import { debounce } from '../utils/debounce';
import Mv from './mv';

export default class Title {
    mv: Mv;
    path: string;
    constructor(routeName?: string) {
        this.path = routeName;
        this.mv = new Mv();
        this.init();
    }
    init(): void {
        EventBus.$on('TRANSITION', this.onTransition.bind(this));
        this.mv.init();
        this.handleEvent();
    }
    onTransition(path: string) {
        switch (path) {
            case 'index':
                this.path = 'index';
                break;
            case 'about':
                this.path = 'about';
                break;
        }
    }
    handleEvent(): void {
        const path = this.path;
        window.addEventListener(
            'scroll',
            () => {
                if (this.path === 'index') this.mv.handleScroll();
            },
            {
                capture: false,
                passive: true,
            }
        );
        window.addEventListener(
            'resize',
            debounce(() => {
                this.mv.handleResize();
            }, 10),
            false
        );
        window.addEventListener(
            'mousemove',
            (e: MouseEvent) => {
                this.mv.handleMove(e);
            },
            false
        );
    }
    cancel() {
        if (this.mv.animFrame) this.mv.cancelAnimFrame(true);
    }
}
