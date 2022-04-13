import { addClass, isContains, removeClass } from '../utils/classList';
import { hasClass } from '../utils/hasClass';
import { lerp } from '../utils/math';
import { Vec3 } from './vec3';

export default class WebGl {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    textImage: {
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        data: ImageData;
    };
    layers: number;
    gap: number;
    size: number;
    particles: {
        position: Vec3;
        target: Vec3;
        interpolant: number;
    }[];
    targets: Vec3[];
    fov: number;
    viewDistance: number;
    target: {
        rotation: {
            x: number;
            y: number;
        };
    };
    rotation: {
        x: number;
        y: number;
    };
    speed: number;
    animFrame?: number;
    vector3: {
        x: number;
        y: number;
        z: number;
    };
    scroll: {
        y: number;
    };
    start: {
        x: number;
        y: number;
    };
    color: {
        front: string;
        back: string;
    };
    font: {
        wight: number;
        size: number;
        family: string;
    };
    horizontal: number;
    particleX: number[];
    text: string;
    elms: {
        study: HTMLElement;
    };
    constructor() {
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.textImage = {
            canvas: null,
            ctx: null,
            data: null,
        };
        this.layers = 5;
        this.gap = 0;
        this.size = 0.2;
        this.particles = [];
        this.targets = [];
        this.fov = 2000;
        this.viewDistance = 200;
        this.target = {
            rotation: {
                x: 0,
                y: 0.5,
            },
        };
        this.rotation = {
            x: 0,
            y: 0.5,
        };
        this.speed = 40;
        this.animFrame = 0;
        this.vector3 = {
            x: 0,
            y: 0,
            z: 0,
        };
        this.scroll = {
            y: 0,
        };
        this.start = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        };
        this.color = {
            front: '144 108 209',
            // front: '88 88 88',
            back: '255, 152, 0',
            // back: '156, 156, 156',
        };
        this.font = {
            wight: 800,
            size: 150,
            family: 'Arial',
        };
        this.horizontal = 0;
        this.particleX = [];
        this.text = 'PORTFOLIO';
        this.elms = {
            study: document.querySelector('.p-study'),
        };
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    // eslint-disable-next-line require-await
    init() {
        this.set();
        this.handleEvent();
    }
    set(): boolean {
        cancelAnimationFrame(this.animFrame);
        this.setTextImage();
        this.setStartPos();
        this.textImage.data = this.getImageData();
        this.targets = this.getTarget(this.textImage.data);
        this.loop();
        return false;
    }
    getImageData(): ImageData {
        const c = this.textImage.canvas;
        const ctx = this.textImage.ctx;
        // フォントを設定・取得
        ctx.font = this.getFont();
        // テキストの描画幅をを測定する
        let w = this.measureTextWidth();
        const h = this.font.size * 1.5;
        this.gap = 7;
        // Adjust font and particle size to git text on screen
        w = this.adjustSize(w, ctx);
        // テキスト用のcanvasサイズを設定
        c.width = w;
        c.height = h;
        // 差分の再計算(文字を構成する1マスの大きさが変わる)
        this.gap = this.setGap();
        this.size = Math.max(this.gap / 2, 1);
        // フォントを設定・取得
        ctx.font = this.getFont();
        // 指定した座標にテキスト文字列を描画し、その文字を現在のfillStyleで塗りつぶす
        ctx.fillText(this.text, 0, this.font.size);
        // Canvasに現在描かれている画像データを取得
        return ctx.getImageData(0, 0, c.width, c.height);
    }
    setTextImage(): void {
        this.textImage.canvas = document.createElement('canvas');
        this.textImage.ctx = this.textImage.canvas.getContext('2d');
    }
    setStartPos(): void {
        this.start = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        };
    }
    // フォントを設定・取得
    getFont(): string {
        // font-weight font-size font-family
        return `${this.font.wight} ${this.font.size}px ${this.font.family}`;
    }
    // テキストの描画幅をを測定する
    measureTextWidth(): number {
        return this.textImage.ctx.measureText(this.text).width;
    }
    adjustSize(width: number, ctx: CanvasRenderingContext2D): number {
        let w = width;
        while (w > window.innerWidth * 0.8) {
            this.font.size -= 1;
            // フォントを設定・取得
            ctx.font = this.getFont();
            // // テキストの描画幅をを測定する
            w = this.measureTextWidth();
        }
        return w;
    }
    getTarget(data: ImageData): Vec3[] {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.start.x = Math.floor(this.start.x - this.textImage.canvas.width / 2);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.start.y = Math.floor(this.start.y - this.textImage.canvas.height / 2);
        // Iterate the image data and determine target coordinates for the flying particles
        for (let i = 0; i < data.data.length; i += 4) {
            const rw = data.width * 4;
            const x = this.start.x + Math.floor((i % rw) / 4);
            const y = this.start.y + Math.floor(i / rw);
            if (data.data[i + 3] > 0 && x % this.gap === 0 && y % this.gap === 0) {
                // layerの数だけ間隔を空けて１列に並べる
                for (let j = 0; j < this.layers; j++) {
                    this.targets.push(Vec3.fromScreenCoords(this.canvas, x, y, j * 1));
                }
            }
        }
        return this.targets.sort((a, b) => a.x - b.x);
    }
    setGap(): number {
        switch (true) {
            case this.font.size >= 70:
                return 8;
            case this.font.size >= 40 && this.font.size < 70:
                return 6;
            case this.font.size < 40:
                return 4;
        }
    }
    loop(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.setTargetPosition();
        this.setParticle();
        this.animFrame = requestAnimationFrame(this.loop.bind(this));
    }
    setTargetPosition(): void {
        for (let i = 0; i < this.speed; i++) {
            if (this.targets.length > 0) {
                const target = this.targets[0];
                const x = this.canvas.width / 2 + target.x * 10;
                const y = this.canvas.height / 2;
                const z = 0;
                // positionを設定
                const position = Vec3.fromScreenCoords(this.canvas, x, y, z);
                // interpolant: 挿入箇所
                const interpolant = 0;
                
                this.particles.push({
                    position,
                    target,
                    interpolant,
                });
                this.targets.splice(0, 1);
            }
        }
    }
    setParticle(): void {
        const list = this.particles.sort((pa, pb) => pb.target.z - pa.target.z);
        list.forEach(async (p, index) => {
            if (p.interpolant < 1) {
                p.interpolant = Math.min(p.interpolant + 0.02, 1);

                p.position.x = lerp(p.position.x, p.target.x, p.interpolant);
                p.position.y = lerp(p.position.y, p.target.y, p.interpolant);
                p.position.z = lerp(p.position.z, p.target.z, p.interpolant);
            }

            this.rotation.x = lerp(this.rotation.x, this.target.rotation.x, 0.00003);
            this.rotation.y = lerp(this.rotation.y, this.target.rotation.y, 0.00003);
            const particle = p.position.rotateX(this.rotation.x).rotateY(this.rotation.y).pp(this.canvas);

            const s = 1 - p.position.z / this.layers;
            this.ctx.fillStyle = p.target.z === 0 ? `rgb(${this.color.front})` : `rgba(${this.color.back}, ${s})`;

            let particleX = particle.x - this.horizontal;
            const scrollY = window.scrollY;
            const study = document.querySelector('.p-study').getBoundingClientRect().top + scrollY;
            if (
                scrollY > study * 0.8 &&
                this.particleX[list.length - 1] &&
                isContains(this.elms.study, hasClass.active)
            ) {
                particleX = lerp(this.particleX[index], particleX, 0.1);
            }
            this.ctx.fillRect(particleX, particle.y, s * this.size, s * this.size);
            this.particleX[index] = particleX;
        });
    }
    handleEvent(): void {
        window.addEventListener(
            'scroll',
            () => {
                const scrollY = window.scrollY;
                const study = document.querySelector('.p-study').getBoundingClientRect().top + scrollY;
                if (!isContains(this.elms.study, hasClass.active)) {
                    if (scrollY < study * 0.8) {
                        if (scrollY === 0) {
                            this.target.rotation.x = 0;
                        } else if (scrollY > this.scroll.y) {
                            this.target.rotation.x = this.rotation.x + 0.5;
                        } else if (scrollY < this.scroll.y) {
                            this.target.rotation.x = this.rotation.x - 0.5;
                        }
                    } else if (scrollY >= study * 0.8) {
                        addClass(this.elms.study, hasClass.active);
                        this.initValue();
                        this.text = 'STUDY';
                        this.color = {
                            front: '0 190 8',
                            back: '255, 135, 232',
                        };
                        this.init();
                    }
                }
                const current = scrollY - document.querySelector('.p-mv').scrollHeight;
                if (isContains(this.elms.study, hasClass.active)) {
                    if (scrollY > study * 0.8) {
                        this.horizontal = current < window.innerWidth / 2 ? 0 : current * 0.8;
                    }
                    if (scrollY < study * 0.8) {
                        removeClass(this.elms.study, hasClass.active);
                        this.initValue();
                        this.text = 'PORTFOLIO';
                        this.color = {
                            front: '144 108 209',
                            back: '255, 152, 0',
                        };
                        this.init();
                    }
                }
                this.scroll.y = scrollY;
            },
            {
                capture: false,
                passive: true,
            }
        );
    }
    handleResize(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    initValue() {
        cancelAnimationFrame(this.animFrame);
        Vec3.resetValue();
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.textImage = {
            canvas: null,
            ctx: null,
            data: null,
        };
        this.layers = 5;
        this.gap = 0;
        this.size = 0.2;
        this.particles = [];
        this.targets = [];
        this.fov = 2000;
        this.viewDistance = 200;
        this.target = {
            rotation: {
                x: 0,
                y: 0.5,
            },
        };
        this.rotation = {
            x: 0,
            y: 0.5,
        };
        this.speed = 40;
        this.animFrame = 0;
        this.vector3 = {
            x: 0,
            y: 0,
            z: 0,
        };
        this.scroll = {
            y: 0,
        };
        this.start = {
            x: 0,
            y: 0,
        };
        this.font = {
            wight: 800,
            size: 150,
            family: 'Arial',
        };
        this.horizontal = 0;
        this.particleX = [];
        this.text = '';
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}
