import gsap from 'gsap';
import { isMobile } from '../../modules/isMobile';
import { lerp } from 'three/src/math/MathUtils';

interface CircleOptions {
    circleSelector: string;
}

const defaults: CircleOptions = {
    circleSelector: '[data-circle]',
};

export default class Circle {
    [x: string]: any;
    params: CircleOptions;
    elms: {
        circle: HTMLElement;
    };
    scroll: {
        previous: number;
        current: number;
        amp: number;
    };
    animFrame: number;
    isMobile: boolean;
    constructor(props: Partial<CircleOptions> = {}) {
        this.params = { ...defaults, ...props };
        this.elms = {
            circle: document.querySelector(this.params.circleSelector),
        };
        this.scroll = {
            previous: 0,
            current: 0,
            amp: 0.1,
        };
        this.isMobile = isMobile();
        if (this.elms.circle) this.init();
    }
    init(): void {
        this.rotate();
    }
    rotate(): void {
        this.scroll.current = this.isMobile
            ? Math.abs(document.querySelector('.p-index-mv').getBoundingClientRect().top)
            : window.scrollY * 0.1;
        this.scroll.previous = lerp(this.scroll.previous, this.scroll.current, this.scroll.amp);
        this.scroll.previous = Math.floor(this.scroll.previous * 100) / 100;
        const tl = gsap.timeline({
            paused: false,
        });
        tl.to(this.elms.circle, {
            duration: 0.1,
            rotate: this.scroll.previous,
        });
        this.animFrame = requestAnimationFrame(() => this.rotate());
    }
    // scroll(): void {
    //     const pageInner = document.querySelector('.p-page__inner');
    //     pageInner.addEventListener('touchmove', (e: TouchEvent) => {
    //         e.touches[0].pageY;
    //     });
    // }
    cancel(): void {
        cancelAnimationFrame(this.animFrame);
    }
}
