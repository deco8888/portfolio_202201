import gsap from 'gsap';
import { lerp } from '~/assets/scripts/utils/math';
import { addClass, removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';
import { throttle } from '~/assets/scripts/utils/throttle';

interface FollowingOption {
    followingSelector: string;
    targetSelector: string;
}

const defaults: FollowingOption = {
    followingSelector: '[data-following]',
    targetSelector: '[data-following-target]',
};

export default class Following {
    params: FollowingOption;
    elms: {
        following: HTMLElement;
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
    flg: {
        isScroll: boolean;
        isScaleUp: boolean;
        isRaycaster: boolean;
    };
    animFrame: number;
    constructor(props: Partial<FollowingOption> = {}) {
        this.params = { ...defaults, ...props };
        this.elms = {
            following: document.querySelector(this.params.followingSelector),
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
                amt: 0.2,
            },
            transY: {
                previous: 0,
                current: 0,
                amt: 0.2,
            },
            // scale: {
            //     previous: 0,
            //     current: 0,
            //     amt: 1,
            // },
        };
        this.rect = {
            width: 0,
            height: 0,
        };
        this.flg = {
            isScroll: false,
            isScaleUp: false,
            isRaycaster: false,
        };
        this.animFrame = 0;
        if (this.elms.following) this.init();
    }
    init(): void {
        // this.handleResize();
        this.getRect();
        // window.addEventListener(
        //     'mousemove',
        //     throttle(() => {
        //     }, 30),
        //     {
        //         capture: false,
        //         passive: true,
        //     }
        // );
    }
    // 要素の位置座標を取得
    getRect(): void {
        this.rect.width = this.elms.following.clientWidth;
        this.rect.height = this.elms.following.clientHeight;
    }
    render(): void {
        if (this.rect) {
            this.styles.transX.current = this.mouse.x - this.rect.width * 0.5;
            this.styles.transY.current = this.mouse.y - this.rect.height * 0.5;
            for (const styles of Object.values(this.styles)) {
                styles.previous = lerp(styles.previous, styles.current, styles.amt);
            }

            gsap.to(this.elms.following, {
                left: this.styles.transX.previous,
                top: this.styles.transY.previous,
            });
            // if (this.flg.isRaycaster) {
            //     gsap.to(this.elms.following, {
            //         duration: 0,
            //         left: this.styles.transX.previous,
            //         top: this.styles.transY.previous,
            //     });
            // } else {
            //     this.styles.scale.current = this.flg.isScaleUp ? 1 : 0.3;
            //     gsap.to(this.elms.following, {
            //         duration: 0,
            //         left: this.styles.transX.previous,
            //         top: this.styles.transY.previous,
            //     });
            // }
        }
        this.animFrame = requestAnimationFrame(this.render.bind(this));
    }
    handleMove(e: MouseEvent): void {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        // this.elms.targets.forEach((target) => {
        //     target.addEventListener('mouseenter', () => this.enter(target));
        //     target.addEventListener('mouseleave', () => this.leave(target));
        // });
    }
    mouseover(flg: boolean): void {
        if (flg) {
            addClass(this.elms.following, hasClass.active);
            this.styles.scale.current = 1;
            this.flg.isRaycaster = true;
        } else {
            removeClass(this.elms.following, hasClass.active);
            this.styles.scale.current = 0.3;
            this.flg.isRaycaster = false;
        }
    }
    getTarget(): void {
        this.elms.targets = document.querySelectorAll(this.params.targetSelector);
    }
    handleResize(): void {}
    enter(target: HTMLElement): void {
        addClass(this.elms.following, hasClass.active);
        addClass(target, 'is-hover');
        this.flg.isScaleUp = true;
    }
    leave(target: HTMLElement): void {
        removeClass(this.elms.following, hasClass.active);
        removeClass(target, 'is-hover');
        this.flg.isScaleUp = false;
    }
    setText(text: string): void {
        const target = document.querySelector('[data-following-bg]');
        target.querySelector('span').innerHTML = text;
        addClass(target, 'is-raycast');
    }
    deleteText(): void {
        const target = document.querySelector('[data-following-bg]');
        target.querySelector('span').innerHTML = '';
        removeClass(target, 'is-raycast');
    }
    cancel(): void {
        cancelAnimationFrame(this.animFrame);
    }
}
