interface SplitTextsOptions {
    selector: string;
    className: string;
    time: number;
}

const defaults: SplitTextsOptions = {
    selector: 'data-split',
    className: '',
    time: 0,
};

export default class SplitTexts {
    params: SplitTextsOptions;
    elms: {
        targets: NodeListOf<HTMLElement>;
    };
    class: {
        previous: string;
        current: string;
    };
    container: string[];
    time: number;
    each: number;
    isCharFlg: boolean;
    constructor(props: Partial<SplitTextsOptions> = {}) {
        this.params = { ...defaults, ...props };
        this.container = [];
        this.time = 1;
        this.elms = {
            targets: document.querySelectorAll(`[${this.params.selector}]`),
        };
        this.class = {
            previous: '',
            current: '',
        };
        this.time = 0.15;
        this.each = 0;
        this.isCharFlg = false;
        this.init();
    }
    init(): void {
        this.elms.targets.forEach((target: HTMLElement, index: number) => {
            const current = target.getAttribute(this.params.selector);
            this.setClass(index, current);
            target.childNodes.forEach((node: Element) => {
                node.nodeType == 3 ? this.splitText(node) : this.container.push(node.outerHTML);
            });
            target.innerHTML = this.container.join('');
            this.container = [];
            this.startAnim(target);
        });
    }
    setClass(index: number, current: string): void {
        if (index > 0) {
            if (current !== this.class.previous) {
                this.class.previous = this.class.current;
                this.class.current = current;
            }
        } else {
            this.class.current = current;
        }
    }
    splitText(node: Element): void {
        // テキストから不要コードを除外
        const texts = node.textContent.replace(/(\t|\n|\r|\f)/g, '').trim();
        texts.split('').forEach((text: string) => this.setText(text));
    }
    setText(text: string): void {
        this.container.push(
            `<span class="${this.class.current}__char" data-char="${this.class.current}">${text}</span>`
        );
    }
    startAnim(el: HTMLElement): void {
        const dataBase = el.getAttribute('data-split-base');
        const dataEach = el.getAttribute('data-split-each');
        const base = dataBase ? parseFloat(dataBase) : 0.15;
        const each = dataEach ? parseFloat(dataEach) : 0.08;
        this.setAnim(el, base, each);
    }
    setAnim(el: HTMLElement, base: number, each: number): void {
        const currentSpans = el.querySelectorAll(`[data-char="${this.class.current}"]`);
        currentSpans.forEach((span: HTMLElement, spanIndex: number) => {
            this.isCharFlg = this.class.previous === this.class.current ? true : false;
            if (spanIndex === 0) this.time = this.isCharFlg ? Number(this.each + this.time) : base;
            this.each = spanIndex * each;
            span.style.animationDelay = this.each + this.time + 's';
            span.style.setProperty('--char-index', `${spanIndex}`);
        });
    }
}
