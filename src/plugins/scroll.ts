import { Plugin } from '@nuxt/types';
import 'intersection-observer';

// 変数の宣言
interface ScrollOptions {
    /**
     * target selector
     */
    selector: string;
    root?: Element | Document | null;
    rootMargin?: string;
    threshold?: number | number[];
    addClass: string;
}

const defaults: ScrollOptions = {
    selector: '[data-scroll]',
    root: null,
    rootMargin: '0px 0px 0px 0px',
    threshold: 0.3,
    addClass: 'is-active',
};

declare module 'vue/types/vue' {
    interface Vue {
        $scrollFunction(props: Partial<ScrollOptions>): void;
    }
}

export class Scroll {
    params!: ScrollOptions;
    targets!: NodeListOf<HTMLElement>;
    isScroll: boolean;
    constructor(props: Partial<ScrollOptions> = {}) {
        this.params = { ...defaults, ...props };
        this.isScroll = false;
        this.init();
    }
    init(): void {
        this.targets = document.querySelectorAll(this.params.selector);
        window.addEventListener('scroll', () => {
            if (this.targets.length > 0) {
                this.setScrollAnim();
            }
        });
    }
    setScrollAnim(): void {
        const options: IntersectionObserverInit = {
            root: this.params.root,
            rootMargin: this.params.rootMargin,
            threshold: this.params.threshold,
        };
        const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            entries.forEach((entry: IntersectionObserverEntry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(this.params.addClass);
                    observer.unobserve(entry.target);
                }
            });
        };
        const observer = new IntersectionObserver(callback, options);
        this.targets.forEach((target: HTMLElement) => {
            observer.observe(target);
        });
    }
}

// inject: 関数を共通化することができる
const scrollPlugin: Plugin = (_context, inject): void => {
    inject('scrollFunction', (props: ScrollOptions) => new Scroll(props));
};

export default scrollPlugin;
