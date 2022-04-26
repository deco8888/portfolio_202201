import gsap from 'gsap';
import { addClass, isContains, removeClass } from '../utils/classList';
import { debounce } from '../utils/debounce';
import { hasClass } from '../utils/hasClass';
import { lerp } from '../utils/math';
import { throttle } from '../utils/throttle';

interface CursorOption {
    cursorSelector: string;
    targetSelector: string;
    headerSelector: string;
    pankuzuSelector: string;
}

const defaults: CursorOption = {
    cursorSelector: '[data-cursor]',
    targetSelector: '[data-cursor-target]',
    headerSelector: 'header',
    pankuzuSelector: '#pankuzu',
};

export class Cursor {
    params: CursorOption;
    elms: {
        cursor: HTMLElement;
        targets: NodeListOf<HTMLElement>;
    };
    mouse: {
        [key: string]: number;
    };
    styles: {
        [key1: string]: {
            [key2: string]: number;
        };
    };
    rect: {
        [key: string]: number;
    };
    headerHeight: number;
    flg: {
        isScroll: boolean;
        isScaleUp: boolean;
        isRaycaster: boolean;
    };
    animFrame: number;
    constructor(props: Partial<CursorOption> = {}) {
        this.params = { ...defaults, ...props };
        this.elms = {
            cursor: document.querySelector(this.params.cursorSelector),
            targets: document.querySelectorAll(this.params.targetSelector),
        };
        this.mouse = {
            x: 0,
            y: 0,
        };
        this.styles = {
            transX: {
                previous: 0,
                current: 0,
                amt: 0.1,
            },
            transY: {
                previous: 0,
                current: 0,
                amt: 0.1,
            },
            scale: {
                previous: 0,
                current: 0,
                amt: 0.1,
            },
        };
        this.rect = {
            width: 0,
            height: 0,
        };
        this.headerHeight = 0;
        this.flg = {
            isScroll: false,
            isScaleUp: false,
            isRaycaster: false,
        };
        this.animFrame = 0;
        this.init();
    }
    init(): void {
        if (this.elms.cursor) {
            // this.handleResize();
            this.getRect();
            this.event();
            this.render();
            window.addEventListener(
                'resize',
                debounce(() => {
                    // this.handleResize();
                }, 30),
                false
            );
            window.addEventListener(
                'scroll',
                throttle(() => {
                    // this.handelScroll();
                }, 30),
                {
                    capture: false,
                    passive: true,
                }
            );
        }
    }
    // 要素の位置座標を取得
    getRect(): void {
        this.rect.width = this.elms.cursor.clientWidth;
        this.rect.height = this.elms.cursor.clientHeight;
    }
    render(): void {
        if (this.rect && !this.flg.isScroll) {
            this.styles.transX.current = this.mouse.x - this.rect.width * 0.5;
            this.styles.transY.current = this.mouse.y - this.rect.height * 0.5;
            for (const styles of Object.values(this.styles)) {
                styles.previous = lerp(styles.previous, styles.current, styles.amt);
            }

            if (this.flg.isRaycaster) {
                gsap.to(this.elms.cursor, {
                    duration: 0,
                    left: this.styles.transX.previous,
                    top: this.styles.transY.previous,
                    scaleX: 3,
                    scaleY: 3,
                });
            } else {
                this.styles.scale.current = this.flg.isScaleUp ? 3 : 1;
                gsap.to(this.elms.cursor, {
                    left: this.styles.transX.previous,
                    top: this.styles.transY.previous,
                    scaleX: this.styles.scale.current,
                    scaleY: this.styles.scale.current,
                });
            }
        }
        this.animFrame = requestAnimationFrame(this.render.bind(this));
    }
    event(): void {
        document.addEventListener('mousemove', (e: MouseEvent) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        this.elms.targets.forEach((target) => {
            target.addEventListener('mouseenter', () => this.enter());
            target.addEventListener('mouseleave', () => this.leave());
        });
    }
    // handelScroll(): void {
    //     this.mouse.x = this.mouse.x;
    //     this.mouse.y = this.mouse.y;
    // }
    mouseover(flg: boolean): void {
        if (flg) {
            // addClass(this.elms.cursor, hasClass.active);
            this.styles.scale.current = 3;
            this.flg.isRaycaster = true;
        } else {
            // removeClass(this.elms.cursor, hasClass.active);
            this.styles.scale.current = 1;
            this.flg.isRaycaster = false;
        }
    }
    getTarget(): void {
        this.elms.targets = document.querySelectorAll(this.params.targetSelector);
    }
    handleResize(): void {
        const header = document.querySelector(this.params.headerSelector);
        const pankuzu = document.querySelector(this.params.pankuzuSelector);
        const headerHeight = header ? header.clientHeight : 0;
        const pankuzuHeight = pankuzu ? pankuzu.clientHeight : 0;
        this.headerHeight = headerHeight + pankuzuHeight;
    }
    enter(): void {
        addClass(this.elms.cursor, hasClass.active);
        this.flg.isScaleUp = true;
    }
    leave(): void {
        removeClass(this.elms.cursor, hasClass.active);
        this.flg.isScaleUp = false;
    }
}
