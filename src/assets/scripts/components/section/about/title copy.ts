/**
Copyright (c) 2022 by JK (https://codepen.io/funxer/pen/KBmRoZ)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { addClass, isContains, removeClass } from '../../../utils/classList';
import { hasClass } from '../../../utils/hasClass';
import { lerp } from '../../../utils/math';
import Letter from '../../letter';
import { Vec3 } from '../../vec3';

interface ParticleOptions {
    position: Vec3;
    target: Vec3;
    interpolant: number;
}

interface TitleOption {}

export default class Title extends Letter {
    params: TitleOption;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    borderColor: string;
    textImage: {
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        data: ImageData;
    };
    layers: number;
    gap: number;
    size: number;
    particles: ParticleOptions[];
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
    isStudyArea: boolean;
    constructor() {
        super();
        this.borderColor = 'rgb(81 162 247)';
        this.textImage = {
            canvas: null,
            ctx: null,
            data: null,
        };
        this.layers = 4;
        this.gap = 0;
        this.size = 0.2;
        this.particles = [];
        this.targets = [];
        this.fov = 2000;
        this.viewDistance = 200;
        this.target = {
            rotation: {
                x: 0,
                y: 0.1,
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
            front: '81 162 247',
            back: '233, 69, 29',
        };
        this.font = {
            wight: 700,
            size: window.innerWidth * 0.1,
            family: 'Arial',
        };
        this.horizontal = 0;
        this.particleX = [];
        this.text = 'ABOUT';
        this.elms = {
            study: document.querySelector('.p-index-study'),
        };
        this.isStudyArea = false;
    }
    // eslint-disable-next-line require-await
    init() {
        this.set();
    }
    set(): boolean {
        cancelAnimationFrame(this.animFrame);
        this.setTextImage();
        console.log(this.textImage.data);
        this.textImage.data = this.getImageData();
        this.setStartPos();
        this.targets = this.getTarget(this.textImage.data);
        this.canvas.style.border = 'solid 10px rgb(81 162 247)';
        this.loop();
        return false;
    }
    setStartPos(): void {
        this.start = {
            x: this.textImage.data.width * 0.7,
            y: window.innerHeight / 2,
        };
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
    loop(): void {
        this.animFrame = requestAnimationFrame(this.loop.bind(this));
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.style.borderColor = this.borderColor;
        this.setTargetPosition();
        this.setParticle();
    }
    setParticle(): void {
        const list = this.particles.sort((pa, pb) => pb.target.z - pa.target.z);
        list.forEach(async (p) => {
            this.setParticlePosition(p);
            this.rotation.x = lerp(this.rotation.x, this.target.rotation.x, 0.00005);
            this.rotation.y = lerp(this.rotation.y, this.target.rotation.y, 0.00005);
            const particle = p.position.rotateX(this.rotation.x).rotateY(this.rotation.y).pp(this.canvas);

            const s = 1 - p.position.z / this.layers;
            this.ctx.fillStyle = p.target.z === 0 ? `rgb(${this.color.front})` : `rgba(${this.color.back}, ${s})`;

            this.ctx.fillRect(particle.x, particle.y, s * this.size, s * this.size);
        });
    }
    handleScroll(): void {
        const scrollY = window.scrollY;
        const study = document.querySelector('.p-index-study').getBoundingClientRect().top + scrollY;
        if (!isContains(this.elms.study, hasClass.active)) {
            if (scrollY < study * 0.85) {
                if (scrollY === 0) {
                    this.target.rotation.x = 0;
                } else if (scrollY > this.scroll.y) {
                    this.target.rotation.x = this.rotation.x + 0.2;
                } else if (scrollY < this.scroll.y) {
                    this.target.rotation.x = this.rotation.x - 0.2;
                }
            }
        }
        const current = scrollY - document.querySelector('.p-index-mv').clientHeight;
        if (isContains(this.elms.study, hasClass.active)) {
            if (scrollY > study * 0.85) {
                this.horizontal = current < window.innerWidth / 2 ? 0 : current * 0.8;
                this.isStudyArea = true;
            }
        }
        this.scroll.y = scrollY;
    }
    handleMove(e: MouseEvent): void {
        this.target.rotation.y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    }
    async initValue(): Promise<void> {
        await this.initCommonValue();
        this.font = {
            wight: 700,
            size: 130,
            family: 'Arial',
        };
    }
}
