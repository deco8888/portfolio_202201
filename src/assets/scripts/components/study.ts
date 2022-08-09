import Photo from './photos';
import EventBus from '~/utils/event-bus';
import { debounce } from '../utils/debounce';
import { throttle } from '../utils/throttle';

export default class Study {
    photo: Photo;
    constructor() {
        this.photo = new Photo();
        this.init();
    }
    init(): void {
        this.photo.init();
        this.handleEvent();
        EventBus.$on('SHOW', this.onTransition.bind(this));
    }
    onTransition(flg: boolean) {
        this.photo.flg.isScroll = !flg;
        if (flg) {
            this.photo.cancelAnimFrame();
        } else {
            this.photo.render();
        }
    }
    handleEvent(): void {
        window.addEventListener(
            'resize',
            () => {
                this.photo.handleResize();
                if (!this.photo.flg.isScroll) {
                    window.scrollTo({
                        top: document.documentElement.scrollHeight,
                        behavior: 'smooth',
                    });
                }
            },
            false
        );
        window.addEventListener(
            'mousemove',
            (e: MouseEvent) => {
                this.photo.handleMouse(e);
            },
            false
        );
        window.addEventListener(
            'mousedown',
            async (e: MouseEvent) => {
                e.preventDefault();
                // await this.photo.openPage();
            },
            false
        );
        window.addEventListener(
            'scroll',
            () => {
                if (this.photo.flg.isScroll) this.photo.handleScroll();
            },
            {
                capture: false,
                passive: true,
            }
        );
    }
    cancel() {
        if (this.photo.animFrame) this.photo.cancelAnimFrame();
    }
}
