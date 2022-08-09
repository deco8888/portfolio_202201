import { isMobile } from '../components/isMobile';
import gsap, { Power4 } from 'gsap';

export default class Attract {
    elms: {
        body: HTMLElement;
        targets: NodeListOf<HTMLElement>;
    };
    strength: number;
    isMobile: boolean;
    constructor() {
        this.elms = {
            body: document.body,
            targets: document.querySelectorAll('[data-attract]'),
        };
        this.strength = 30;
        this.isMobile = isMobile();
        this.init();
    }
    init(): void {
        if (this.isMobile) return;
        this.elms.targets.forEach((target) => {
            target.addEventListener('mousemove', (e: MouseEvent) => {
                const attractButton = e.currentTarget as HTMLElement;
                const { left, top } = attractButton.getBoundingClientRect();
                gsap.to(attractButton, {
                    ease: Power4.easeOut,
                    duration: 0.1,
                    x: ((e.clientX - left) / attractButton.offsetWidth - 0.5) * this.strength,
                    y: ((e.clientY - top) / attractButton.offsetHeight - 0.5) * this.strength,
                });
            });
            target.addEventListener('mouseout', (e: MouseEvent) => {
                gsap.to(e.currentTarget, {
                    ease: Power4.easeOut,
                    x: 0,
                    y: 0,
                })
            })
        });
    }
}
