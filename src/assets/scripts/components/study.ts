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
    }
    handleEvent(): void {
        window.addEventListener(
            'resize',
            debounce(() => {
                this.photo.handleResize();
            }, 10),
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
                await this.photo.openPage();
            },
            false
        );
        window.addEventListener(
            'scroll',
            throttle(() => {
                this.photo.handleScroll();
                setTimeout(() => {
                    this.photo.flg.isScroll = false;
                }, 10);
            }, 10),
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
