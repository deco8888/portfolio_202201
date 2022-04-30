/**
Copyright (c) 2022 by JK (https://codepen.io/funxer/pen/KBmRoZ)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { lerp } from '../utils/math';
import { Vec3 } from './vec3';

interface ParticleOptions {
    position: Vec3;
    target: Vec3;
    interpolant: number;
}

export default class Letter {
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
        this.canvas = document.querySelector('[data-canvas="title"]');
        this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d', { willReadFrequently: true });
        this.borderColor = 'rgb(152 120 210)';
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
        this.font = {
            wight: 500,
            size: 150,
            family: 'Arial',
        };
        this.horizontal = 0;
        this.particleX = [];
        this.text = 'PORTFOLIO';
        this.elms = {
            study: document.querySelector('.p-index-study'),
        };
        this.isStudyArea = false;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    async cancelAnimFrame(isTransition: boolean): Promise<void> {
        return new Promise((resolve) => {
            cancelAnimationFrame(this.animFrame);
            const pCanvas = this.canvas;
            const tCanvas = this.textImage.canvas;
            // console.log(tCanvas);
            if (pCanvas) {
                pCanvas.width = 0;
                pCanvas.height = 0;
                if (isTransition) pCanvas.parentNode.removeChild(pCanvas);
            }
            if (tCanvas) {
                tCanvas.width = 0;
                tCanvas.height = 0;
                tCanvas.remove();
            }
            setTimeout(() => {
                resolve();
            }, 100);
        });
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
        this.textImage.canvas.classList.add('test');
        this.textImage.ctx = <CanvasRenderingContext2D>this.textImage.canvas.getContext('2d', {
            willReadFrequently: true,
        });
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
            // ex: i = 4; data.width = 100; 4 / (100 * 4) / 4 = 1;
            //     i = 8; data.width = 100; 8 / (100 * 4) / 4 = 2;
            const x = this.start.x + Math.floor((i % rw) / 4);
            const y = this.start.y + Math.floor(i / rw);
            // alphaの箇所を取得
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
                return 7;
            case this.font.size >= 40 && this.font.size < 70:
                return 6;
            case this.font.size < 40:
                return 4;
        }
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
    setParticlePosition(p: ParticleOptions): void {
        if (p.interpolant < 1) {
            p.interpolant = Math.min(p.interpolant + 0.02, 1);
            p.position.x = lerp(p.position.x, p.target.x, p.interpolant);
            p.position.y = lerp(p.position.y, p.target.y, p.interpolant);
            p.position.z = lerp(p.position.z, p.target.z, p.interpolant);
        }
    }
    handleResize(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    handleMove(e: MouseEvent): void {
        this.target.rotation.y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    }
    async initCommonValue(): Promise<void> {
        await this.cancelAnimFrame(false);
        Vec3.resetValue();
        this.canvas = document.querySelector('[data-canvas="title"]');
        this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d', { willReadFrequently: true });
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
