import * as THREE from 'three';
import { BufferGeometry, Points, Vector3 } from 'three';
import vertexShader from '../glsl/vertexshader.vert';
import fragmentShader from '../glsl/fragmentShader.frag';
import { throttle } from '../utils/throttle';
import { lerp } from '../utils/math';
import { Vec3 } from '../components/vec3';
import Webgl from './webgl';

interface ParticleOptions {
    position: Vec3;
    target: Vec3;
    interpolant: number;
}

interface ThreeNumber {
    [key: string]: number;
}

interface elemInfoOptions {
    object: THREE.Object3D | null;
    current: number;
    previous: number;
    ease: number;
    parallax: number;
}

export default class Letter extends Webgl {
    three: {
        camera: THREE.PerspectiveCamera | null;
        scene: THREE.Scene;
        geometry: THREE.BufferGeometry | null;
        mesh: THREE.Mesh | THREE.Mesh[] | null;
        points: THREE.Points | null;
        object: THREE.Object3D | null;
        renderer: THREE.WebGLRenderer | null;
        clock: THREE.Clock | null;
    };
    attributes: {
        position: {
            [key: string]: number[];
        };
        color: number[];
        alpha: number[];
    };
    coord: {
        [key: string]: {
            x: number;
            y: number;
            z: number;
        };
    };
    winSize: ThreeNumber;
    time: ThreeNumber;
    viewport!: ThreeNumber;
    flg: {
        isMove: boolean;
    };
    elemInfo: elemInfoOptions;
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
    animFrame?: number;
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
    vertices: number[];
    title: {
        firstList: {
            [key: string]: number[];
        };
        secondList: {
            [key: string]: number[];
        };
    };
    constructor() {
        super();
        this.three = {
            camera: null,
            scene: new THREE.Scene(),
            geometry: null,
            mesh: null,
            points: null,
            object: null,
            renderer: null,
            clock: null,
        };
        this.attributes = {
            position: {
                first: [],
                second: [],
            },
            color: [],
            alpha: [],
        };
        this.coord = {
            first: {
                x: 0,
                y: 0,
                z: 0,
            },
            second: {
                x: 0,
                y: 0,
                z: 0,
            },
        };
        this.winSize = {
            width: 0,
            height: 0,
        };
        this.time = {
            total: 0,
            delta: 0,
        };
        this.flg = {
            isMove: false,
        };
        this.elemInfo = {
            object: null,
            current: 0,
            previous: 0,
            ease: 0.1,
            parallax: 1,
        };
        this.textImage = {
            canvas: null,
            ctx: null,
            data: null,
        };
        this.layers = 4;
        this.gap = 0;
        this.size = 0.2;
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
        this.animFrame = 0;
        this.start = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        };
        this.color = {
            front: '#51a2f7',
            back: '#e9451d',
        };
        this.font = {
            wight: 700,
            size: window.innerWidth * 0.1,
            family: 'Nippo',
        };
        this.horizontal = 0;
        this.particleX = [];
        this.text = 'CONTACT';
        this.vertices = [];
        this.title = {
            firstList: {},
            secondList: {},
        };
    }
    async prepare(): Promise<void> {
        this.setSize();
        // カメラを作成
        this.three.camera = this.initCamera();
        // カメラをシーンに追加
        this.three.scene.add(this.three.camera);
        // レンダラーを作成
        this.three.renderer = this.initRenderer();
        // HTMLに追加
        this.canvas.appendChild(this.three.renderer.domElement);
        // ビューポート計算
        this.viewport = this.initViewport();
        // タイトルの位置・色・アルファ情報を取得
        await this.getTitleInfo();
        // メッシュを作成
        this.three.object = this.initMesh();
        // メッシュをシーンに追加
        this.three.scene.add(this.three.object);
    }
    initMesh(): THREE.Object3D {
        this.three.geometry = new BufferGeometry();
        for (const [attribute, list] of Object.entries(this.title.firstList)) {
            const size = attribute === 'alpha' ? 1 : 3;
            this.setAttribute(attribute, list, size);
        }
        const uniforms = {
            uTime: {
                value: 0.0,
            },
            uRandom: {
                value: 1.0,
            },
            uDepth: {
                value: 2.0,
            },
            uSize: {
                value: 9.0,
            },
        };
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
            side: THREE.DoubleSide,
            // ブレンドモード: AdditiveBlending➡加算合成
            // blending: THREE.AdditiveBlending,
            // 陰面処理を有効化するかのフラグ。陰面処理とは "ある視点から見えない部分の面を消去する" という処理のこと。
            depthTest: false,
            extensions: {
                derivatives: true,
            },
        });
        const points = new Points(this.three.geometry, material);
        this.three.points = points;
        const object = new THREE.Object3D();
        object.clear();
        object.add(points);
        return object;
    }
    setAttribute(name: string, array: number[], itemSize: number): void {
        this.three.geometry.setAttribute(name, new THREE.Float32BufferAttribute(array, itemSize));
    }
    async getTitleInfo(): Promise<void> {
        // テキスト画像をセット
        this.setTextImage();
        this.textImage.data = await this.getImageData();
        const width = this.textImage.canvas.width;
        const height = this.textImage.canvas.height;
        const data = this.textImage.data.data;
        const position = this.attributes.position;
        const alpha = this.attributes.alpha;
        const color = this.attributes.color;

        for (let y = 0; y < height; y += 7.0) {
            for (let x = 0; x < width; x += 7.0) {
                const index = (y * width + x) * 4;
                let a = data[index + 3] / 255;
                this.coord.first.x = 0;
                this.coord.first.y = 0;
                this.coord.second.x = x - width / 2;
                this.coord.second.y = -(y - height / 2);
                for (let j = 0; j < this.layers; j++) {
                    if (j === this.layers - 1) {
                        this.setAttributeColor(this.color.front);
                    } else {
                        this.setAttributeColor(this.color.back);
                        if (a > 0) a = j + 4 * 0.1;
                    }
                    position.first.push(this.coord.first.x, this.coord.first.y, j * 5);
                    position.second.push(this.coord.second.x, this.coord.second.y);
                    alpha.push(a);
                }
            }
        }
        this.title.firstList = {
            position: position.first,
            color: color,
            alpha: alpha,
        };
        this.title.secondList = {
            position: position.second,
            color: color,
            alpha: alpha,
        };
    }
    setAttributeColor(type: string): void {
        const color = new THREE.Color(type);
        this.attributes.color.push(color.r, color.g, color.b);
    }
    update(): void {
        const geometry = <THREE.BufferGeometry>this.three.points.geometry;
        const geometryPosition = geometry.attributes.position;
        const positionList = geometryPosition.array;
        const promiseList = this.title.secondList.position;

        for (let i = 0; i < positionList.length / 3; i++) {
            const previousX = geometryPosition.getX(i);
            const previousY = geometryPosition.getY(i);
            const lastX = promiseList[i * 2];
            const lastY = promiseList[i * 2 + 1];
            const currentX = lerp(previousX, lastX, 0.1);
            const currentY = lerp(previousY, lastY, 0.08);
            geometryPosition.setX(i, currentX);
            geometryPosition.setY(i, currentY);
            geometryPosition.needsUpdate = true;
        }
    }
    setSize(): void {
        this.winSize = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }
    handleEvent(): void {
        window.addEventListener(
            'resize',
            throttle(() => {
                this.handleResize();
            }, 100),
            false
        );
    }
    handleResize(): void {
        this.setSize();
        if (this.three.camera) {
            // カメラのアスペクト比を正す
            this.three.camera.aspect = this.winSize.width / this.winSize.height;
            this.three.camera.updateProjectionMatrix();
            if (this.three.renderer) this.three.renderer.setSize(this.winSize.width, this.winSize.height);
        }
    }
    async getImageData(): Promise<ImageData> {
        return new Promise((resolve) => {
            const c = this.textImage.canvas;
            const ctx = this.textImage.ctx;
            // フォントを設定・取得
            this.textImage.ctx.font = this.getFont();
            // テキストの描画幅をを測定する
            let w = this.measureTextWidth();
            let h = this.font.size * 1.5;
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
            return setTimeout(() => {
                ctx.fillText(this.text, 0, this.font.size);
                // テキストの描画幅をを測定する
                let w = this.measureTextWidth();
                let h = this.font.size * 1.5;
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
                ctx.fillText(this.text, 0, this.font.size);
                // Canvasに現在描かれている画像データを取得
                return resolve(ctx.getImageData(0, 0, c.width, c.height));
            }, 200);
        });
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
        return w;
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
    handleMove(e: MouseEvent): void {
        this.three.object.rotation.x = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    }
    async initCommonValue(): Promise<void> {
        this.horizontal = 0;
        this.attributes = {
            position: {
                first: [],
                second: [],
            },
            color: [],
            alpha: [],
        };
        this.textImage = {
            canvas: null,
            ctx: null,
            data: null,
        };
    }
    async cancelAnimFrame(isTransition: boolean): Promise<void> {
        return new Promise((resolve) => {
            cancelAnimationFrame(this.animFrame);
            // const pCanvas = this.canvas;
            // const tCanvas = this.textImage.canvas;
            // if (pCanvas) {
            //     pCanvas.width = 0;
            //     pCanvas.height = 0;
            //     if (isTransition) pCanvas.remove();
            // }
            // if (tCanvas) {
            //     tCanvas.width = 0;
            //     tCanvas.height = 0;
            //     tCanvas.remove;
            // }
            resolve();
        });
    }
    setBorderStyle(rgb: string): void {
        this.borderColor = `rgb(${rgb})`;
        this.canvas.style.borderColor = this.borderColor;
    }
}
