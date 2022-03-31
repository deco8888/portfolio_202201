import { Vector3 } from "three";

export default class WebGl {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    layers: number;
    size: number;
    particles: [];
    targets: THREE.Vector3[];
    fov: number;
    viewDistance: number;
    targetRotationY: number;
    rotationY: number;
    speed: number;
    animFrame?: number;
    vector3: {
        x: number;
        y: number;
        z: number;
    }

    fontSize: number;
    constructor() {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.layers = 4;
        this.size = 0;
        this.particles = [];
        this.targets = [];
        this.fov = 2000;
        this.viewDistance = 200;
        this.targetRotationY = 0.5;
        this.rotationY = 0.5;
        this.speed = 40;
        this.animFrame = 0;
        this.vector3 = {
            x: 0,
            y: 0,
            z: 0
        }
        this.fontSize = 150;
    }
    // 画面座標
    fromScreenCoodinates(_x: number, _y: number, _z: number): Vector3 {
        // fov / viewDiatance
        if (this.canvas) this.canvas = document.createElement("canvas");
        const factor = 2000 / 200;
        const x = (_x - this.canvas.width / 2) / factor;
        const y = (_y - this.canvas.height / 2) / factor;
        // eslint-disable-next-line eqeqeq
        const z = _z! == undefined ? _z : 0;
        return new Vector3(x, y, z);
    }
    // eslint-disable-next-line require-await
    init() {
        cancelAnimationFrame(this.animFrame);
        const text = "Nakamura Ayaka";
        let startX = window.innerWidth / 2;
        let startY = window.innerHeight / 2;

        // Create temp canvas for the text, draw it and get the image data.
        const c = document.createElement("canvas");
        const cx = c.getContext("2d");
        // font-weight font-size font-family
        cx.font = `800 ${this.fontSize}px Arial`;
        // measureText(text)：テキストの描画幅をを測定する
        let w = cx.measureText(text).width;
        const h = this.fontSize * 1.5;
        let gap = 7;

        console.log(w);
        // Adjust font and particle size to git text on screen
        while (w > window.innerWidth * 0.8) {
            this.fontSize -= 1;
            cx.font = `800 ${this.fontSize}px Arial`;
            w = cx.measureText(text).width;
        }
        // 差分の再計算
        gap = this.setGap();
        this.size = Math.max(gap / 2, 1);
        c.width = w;
        c.height = h;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        startX = Math.floor(startX - w / 2);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        startY = Math.floor(startY - h / 2);

        console.log(cx.font);
        console.log(this.fontSize);
        cx.fillText(text, 0, this.fontSize);
        const data = cx.getImageData(0, 0, w, h);
        console.log(data);

        // Iterate the image data and determine target coordinates for the flying particles
        for (let i = 0; i < data.data.length; i += 4) {
            const rw = data.width * 4;
            const rh = data.height * 4;
            const x = startX + Math.floor((i % rw) / 4);
            const y = startY + Math.floor(i / rh);
            // console.log("x : " + x + " y : " + y);

            if (data.data[i + 3] > 0 && x % gap === 0 && y % gap === 0) {
                for (let j = 0; j < this.layers; j++) {
                    this.targets.push(this.fromScreenCoodinates(x, y, j * 1));
                }
            }
        }

        this.targets = this.targets.sort((a, b) => {
            // console.log("----------");
            // console.log("a");
            // console.log(a);
            // console.log("b");
            // console.log(b);
            // console.log("----------");
            return a.x - b.x;
        });
        this.loop();
        return false;
    }
    setGap(): number {
        switch (true) {
            case this.fontSize >= 70 && this.fontSize < 100:
                return 6;
            case this.fontSize >= 40 && this.fontSize < 70:
                return 4;
            case this.fontSize < 40:
                return 2;
        }
    }
    loop() {
        console.log(this.ctx);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.animFrame = requestAnimationFrame(this.loop);
    }

    handleResize() {
        console.log("handleResize");
    }
}