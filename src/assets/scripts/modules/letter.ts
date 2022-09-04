import {
    PerspectiveCamera,
    Scene,
    BufferGeometry,
    Mesh,
    Points,
    Object3D,
    WebGLRenderer,
    Clock,
    ShaderMaterial,
    Float32BufferAttribute,
    Color,
    Raycaster,
    Vector2,
    PointLight,
} from 'three';
import gsap, { Sine, Back } from 'gsap';
import letterVertexShader from '../glsl/letter/vertexshader.vert';
import letterFragmentShader from '../glsl/letter/fragmentShader.frag';
import { lerp } from '../utils/math';
import Webgl from './webgl';
import { distance3d, radians } from '../utils/helper';
import { isMobile } from '~/assets/scripts/modules/isMobile';

interface ThreeNumber {
    [key: string]: number;
}

interface elemInfoOptions {
    object: Object3D | null;
    current: number;
    previous: number;
    ease: number;
    parallax: number;
}

export default class Letter extends Webgl {
    three: {
        camera: PerspectiveCamera | null;
        scene: Scene;
        geometry: BufferGeometry | null;
        mesh: Mesh | Mesh[] | null;
        floor: THREE.Mesh | null;
        points: Points | null;
        object: Object3D | null;
        renderer: WebGLRenderer | null;
        clock: Clock | null;
        pointLight: PointLight | null;
    };
    raycaster: Raycaster;
    attributes: {
        position: {
            [key: string]: number[];
        };
        color: number[];
        alpha: number[];
        size: number[];
    };
    coord: {
        [key: string]: {
            x: number;
            y: number;
            z: number;
        };
    };
    winSize: ThreeNumber;
    firstWinSize: ThreeNumber;
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
    vector3: {
        x: number;
        y: number;
        z: number;
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
        threshold: number;
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
    isFlg: boolean;
    isFirst: boolean;
    mouse: THREE.Vector2;
    portfolio: number[];
    particleSize: number;
    interval: number;
    isMobile: boolean;
    constructor() {
        super();
        this.three = {
            camera: null,
            scene: new Scene(),
            geometry: null,
            mesh: null,
            floor: null,
            points: null,
            object: null,
            renderer: null,
            clock: null,
            pointLight: null,
        };
        this.raycaster = new Raycaster();
        this.attributes = {
            position: {
                first: [],
                second: [],
            },
            color: [],
            alpha: [],
            size: [],
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
        this.layers = 5;
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
            wight: 900,
            size: window.innerWidth * 0.1,
            family: "'Gill Sans', sans-serif", //"'Red Hat Display', sans-serif", //"Arial", //"'Nippo', sans-serif",
            threshold: 0.12,
        };
        this.horizontal = 0;
        this.particleX = [];
        this.text = 'CONTACT';
        this.vertices = [];
        this.title = {
            firstList: {},
            secondList: {},
        };
        this.isFlg = true;
        this.isFirst = true;
        this.mouse = new Vector2();
        this.portfolio = [];
        this.isMobile = isMobile();
        // パーティクルの間隔
        this.interval = this.isMobile ? 4.0 : 6.0;
        // パーティクルサイズ
        this.particleSize = (this.isMobile ? 2 : 5) * window.devicePixelRatio;
    }
    async prepare(): Promise<void> {
        this.setSize();
        this.firstWinSize = this.winSize;
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
    }
    async createTextImage(): Promise<void> {
        if (!this.textImage.data) {
            // タイトルの位置・色・アルファ情報を取得
            // テキスト画像をセット
            this.setTextImage();
            this.textImage.data = await this.getImageDataFirst();
            await this.getTitleInfo();
        }
        this.createObject();
    }
    createObject(): void {
        // メッシュを作成
        this.three.points = this.initMesh();
        this.three.object = new Object3D();
        this.three.object.add(this.three.points);
        this.three.object.position.z = 0;
        // メッシュをシーンに追加
        this.three.scene.add(this.three.object);
        // if (this.three.object) this.three.object.position.setZ(-1);
        // this.initFloor();
    }
    initMesh(): Points {
        this.three.geometry = new BufferGeometry();
        for (const [attribute, list] of Object.entries(this.title.firstList)) {
            const size = attribute === 'alpha' || attribute === 'size' ? 1 : 3;
            this.setAttribute(attribute, list, size);
        }
        const randomList = [];
        const vertices = this.title.firstList.position.length / 3;
        for (let i = 0; i < vertices; i++) {
            randomList.push((Math.random() - 1.0) * 2.0, (Math.random() - 1.0) * 2.0);
            this.setAttribute('random', randomList, 2);
        }
        const rand = [];
        for (let i = 0; i < this.title.firstList.position.length / 3; i++) {
            rand.push(Math.random() - 1.0);
        }
        this.setAttribute('rand', rand, 1);

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
                value: 12.0,
            },
            uRatio: {
                value: 0.0,
            },
            uFirst: {
                value: this.isFirst,
            },
        };
        const material = new ShaderMaterial({
            uniforms,
            vertexShader: letterVertexShader,
            fragmentShader: letterFragmentShader,
            transparent: true,
            // ブレンドモード: AdditiveBlending➡加算合成
            // blending: AdditiveBlending,
            // 陰面処理を有効化するかのフラグ。陰面処理とは "ある視点から見えない部分の面を消去する" という処理のこと。
            // depthTest: false,
            // extensions: {
            //     derivatives: true,
            // },
            // depthWrite: true
        });
        const points = new Points(this.three.geometry, material);
        // points.frustumCulled = false;
        this.three.points = points;
        return points;
    }
    setDiffusion(): void {
        const pointsMaterial = <ShaderMaterial>this.three.points.material;
        const tl = gsap.timeline({
            paused: true,
        });
        tl.to(pointsMaterial.uniforms.uRatio, {
            value: 0.7,
            duration: 1,
            delay: 0,
            ease: Sine.easeInOut,
            // repeat: 1,
            // yoyo: true,
            // onComplete: () => (this.isFlg = false),
        });
        tl.to(
            pointsMaterial.uniforms.uRatio,
            {
                value: 0.0,
                duration: 1,
                // delay: 0,
                ease: Back.easeInOut,
                // repeat: 1,
                // yoyo: true,
                onComplete: () => (this.isFlg = false),
            },
            0.8
        );
        tl.play();
    }
    setAttribute(name: string, array: number[], itemSize: number): void {
        this.three.geometry.setAttribute(name, new Float32BufferAttribute(array, itemSize));
    }
    async getTitleInfo(): Promise<void> {
        const width = this.textImage.canvas.width;
        const height = this.textImage.canvas.height;
        const data = this.textImage.data.data;
        const position = this.attributes.position;
        const alpha = this.attributes.alpha;
        const color = this.attributes.color;
        const size = this.attributes.size;

        for (let x = 0; x < width; x += this.interval) {
            for (let y = 0; y < height; y += this.interval) {
                const index = (y * width + x) * 4;
                let a = data[index + 3] / 255;
                // const rw = width * 5;
                this.coord.first.x = 0; //Math.floor(x % rw) / 5;
                this.coord.first.y = 0;
                this.coord.second.x = x - width / 2;
                this.coord.second.y = -(y - height / 2);
                for (let j = 0; j < this.layers; j++) {
                    if (j === this.layers - 1) {
                        this.setAttributeColor(this.color.front);
                    } else {
                        this.setAttributeColor(this.color.back);
                        if (a > 0) a = Math.min(Math.max(j + 4 * 0.1, 0.7), 1);
                    }
                    if (a > 0) {
                        position.first.push(this.coord.first.x, this.coord.first.y, j * 10);
                        position.second.push(this.coord.second.x, this.coord.second.y);
                        alpha.push(a);
                        size.push(this.particleSize);
                    }
                }
            }
        }
        this.title.firstList = {
            position: this.portfolio ? (this.portfolio.length ? this.portfolio : position.first) : position.first,
            color: color,
            alpha: alpha,
            size: size,
        };
        this.title.secondList = {
            position: position.second,
            color: color,
            alpha: alpha,
            size: size,
        };
    }
    setAttributeColor(type: string): void {
        const color = new Color(type);
        this.attributes.color.push(color.r, color.g, color.b);
    }
    update(): void {
        const geometry = <BufferGeometry>this.three.points.geometry;
        const geometryPosition = geometry.attributes.position;
        const positionList = geometryPosition.array;
        const promiseList = this.title.secondList.position;
        for (let i = 0; i < positionList.length / 3; i++) {
            const previousX = geometryPosition.getX(i);
            const previousY = geometryPosition.getY(i);
            const lastX = promiseList[i * 2];
            const lastY = promiseList[i * 2 + 1];
            const currentX = lerp(previousX, lastX, 0.08);
            const currentY = lerp(previousY, lastY, 0.08 * (i + 1));
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
    // handleEvent(): void {
    //     window.addEventListener(
    //         'resize',
    //         throttle(() => {
    //             this.handleResize();
    //         }, 100),
    //         false
    //     );
    // }
    onResize(): void {
        this.setSize();
        if (this.three.renderer) {
            this.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.three.renderer.setSize(this.winSize.width, this.winSize.height);
        }
        if (this.three.camera) {
            // カメラのアスペクト比を正す
            this.three.camera.aspect = this.winSize.width / this.winSize.height;
            this.three.camera.updateProjectionMatrix();
        }
        if (this.three.object) {
            const scale = this.winSize.width / this.firstWinSize.width;
            this.three.object.scale.set(scale, scale, scale);
        }
    }
    async getImageDataFirst(): Promise<ImageData> {
        return new Promise(async (resolve) => {
            // await this.getImageData();
            return setTimeout(async () => {
                return resolve(await this.getImageData());
            }, 100);
        });
    }
    async getImageData(): Promise<ImageData> {
        const c = this.textImage.canvas;
        const ctx = this.textImage.ctx;
        // フォントを設定・取得
        this.textImage.ctx.font = this.getFont();
        // テキストの描画幅をを測定する
        let w = this.measureTextWidth(this.text);
        let h = this.font.size;
        this.gap = 5;
        // Adjust font and particle size to git text on screen
        w = this.adjustSize(w, ctx);

        const match = this.text.match('¥n');
        let word = '';
        if (match) {
            const splitWord = this.text.split('¥n');
            const wordNum = splitWord.length;
            h = this.font.size * wordNum * 2;
            for (let i = 0; i < wordNum; i++) {
                if (splitWord[i].length > word.length) word = splitWord[i];
            }
            w = this.measureTextWidth(word);
        }

        // テキスト用のcanvasサイズを設定
        c.width = w;
        c.height = h;
        // 差分の再計算(文字を構成する1マスの大きさが変わる)
        this.gap = this.setGap();
        this.size = Math.max(this.gap / 1.5, 1);
        // フォントを設定・取得
        ctx.font = this.getFont();

        if (match) {
            const splitWord = this.text.split('¥n');
            const wordNum = splitWord.length;
            let size = 0;
            for (let i = 0; i < wordNum; i++) {
                size = this.font.size * 2 + this.font.size * i;
                let x = 0;
                if (splitWord[i] !== word) {
                    x = (w - this.measureTextWidth(splitWord[i])) / 2;
                }
                // 指定した座標にテキスト文字列を描画し、その文字を現在のfillStyleで塗りつぶす
                ctx.fillText(splitWord[i], x, size);
            }
        } else {
            ctx.fillText(this.text, 0, this.font.size);
        }
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
    measureTextWidth(text: string): number {
        return this.textImage.ctx.measureText(text).width;
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
    handleMove(e: Partial<MouseEvent>): void {
        if (this.three.object) this.three.object.rotation.x = (e.clientY - window.innerHeight / 2) / window.innerHeight;
        if (this.textImage.canvas) {
            this.mouse.x = e.clientX - this.winSize.width * 0.5;
            this.mouse.y = -(e.clientY - this.winSize.height * 0.5);
        }
        if (this.three.points) {
            const geometry = <BufferGeometry>this.three.points.geometry;
            const geometryPosition = geometry.attributes.position;
            geometryPosition.needsUpdate = true;
        }
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
            size: [],
        };
        this.textImage = {
            canvas: null,
            ctx: null,
            data: null,
        };
    }
    async cancel(): Promise<void> {
        return new Promise((resolve) => {
            cancelAnimationFrame(this.animFrame);
            this.three.scene.clear();
            // this.three.scene.remove(this.three.object);
            // this.three.object = null;

            if (this.three.points) {
                const material = <ShaderMaterial>this.three.points.material;
                material.dispose();
                this.three.points.geometry.dispose();
                // this.three.points = null;
            }
            // this.three.renderer.forceContextLoss();
            // const gl = this.three.renderer.getContext();
            // console.log('-----');
            // console.log(gl);
            // gl.clearColor(0.0, 0.0, 0.0, 1.0);
            // gl.clear(gl.COLOR_BUFFER_BIT);
            // console.log(gl);
            // this.three.renderer.domElement.remove()
            // this.three.renderer.clear();
            this.three.renderer.dispose();
            this.three.renderer.domElement.remove();
            this.three.renderer = null;
            // this.three.renderer = null;
            // console.log(this.three.renderer.domElement);
            // console.log(this.three.renderer.getContext());
            // if (gl) {
            //     gl.clearColor(0.0, 0.0, 0.0, 1.0);
            //     gl.clear(gl.COLOR_BUFFER_BIT);
            //     this.three.renderer.domElement = null;
            //     console.log(this.three.renderer.forceContextLoss());
            //     this.three.renderer = null;
            // }
            // // this.three.renderer.context = null;
            // // this.three.renderer.domElement = null;
            resolve();
        });
    }
    setBorderStyle(rgb: string): void {
        this.canvas.setAttribute('data-title', rgb);
    }
    addTime() {
        const pointsMaterial = <ShaderMaterial>this.three.points.material;
        let timeValue = pointsMaterial.uniforms.uTime.value as number;
        timeValue += 0.001;
        pointsMaterial.uniforms.uTime.value = timeValue;
    }
    raycast(): void {
        this.raycaster.setFromCamera(this.mouse, this.three.camera);
        this.raycaster.params.Points.threshold = 5;
        const geometry = <BufferGeometry>this.three.points.geometry;
        const position = geometry.attributes.position;
        const size = geometry.attributes.size;
        // const intersects = this.raycaster.intersectObject(this.three.points);
        const isRotate = this.three.object.rotation.y <= radians(90);
        const imageHalfWidth = this.textImage.canvas.width / 2;
        const mouseX = isRotate ? this.mouse.x : this.mouse.x;
        const mouseY = this.mouse.y;
        const targetZ = isRotate ? imageHalfWidth : 0;
        if (this.mouse.x !== 0) {
            for (let i = 0; i < position.array.length / 3; i++) {
                // 交際位置からグリッド要素までの距離を計算
                const x2 = position.array[i * 3] + this.three.object.position.x;
                const y2 = position.array[i * 3 + 1] + this.three.object.position.y;
                const z2 = position.array[i * 3 + 2] + this.three.object.position.z;
                const mouseDistance = distance3d(mouseX, mouseY, 0, x2, y2, z2);
                const upSize = 10 * window.devicePixelRatio;

                if (mouseDistance < 100 && size.array[i] !== upSize) {
                    size.array[i] = lerp(size.array[i], upSize, 0.1);
                }
            }
        }
        for (let i = 0; i < position.array.length / 3; i++) {
            if (size.array[i] !== this.particleSize) {
                size.array[i] = lerp(size.array[i], this.particleSize, 0.1);
            }
        }
        position.needsUpdate = true;
        size.needsUpdate = true;
    }
}
