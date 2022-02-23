import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap, { Power2 } from 'gsap';
import { BufferGeometry, Points } from 'three';
import vertexShader from '../glsl/name/vertexshader.vert';
import fragmentShader from '../glsl/name/fragmentShader.frag';
import { throttle } from '../utils/throttle';
import { lerp } from '../utils/math';
import { name } from '../const/name';

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

export default class Webgl {
    canvas: HTMLCanvasElement;
    wrapper: HTMLElement;
    context: {
        ctx: CanvasRenderingContext2D;
    }
    image: {
        el: HTMLImageElement;
        width: number;
        height: number;
    }
    three: {
        camera: THREE.PerspectiveCamera;
        scene: THREE.Scene;
        mesh: THREE.Mesh;
        stars: THREE.Points;
        renderer: THREE.WebGLRenderer;
        object: THREE.Object3D;
        control: OrbitControls;
        clock: THREE.Clock;
    };
    winSize: ThreeNumber;
    time: ThreeNumber;
    viewport!: ThreeNumber;
    flg: {
        isMove: boolean;
    };
    elemInfo: elemInfoOptions;
    meshList: THREE.Mesh[];
    sizeList: number[];
    step: number;
    name: {
        imageList: {
            [key: string]: number[]
        },
        promiseList: []
    }
    constructor() {
        this.canvas = null;
        this.context = {
            ctx: null,
        }
        this.image = {
            el: null,
            width: 0,
            height: 0,
        }
        this.three = {
            camera: null,
            scene: new THREE.Scene(),
            mesh: null,
            stars: null,
            renderer: null,
            object: null,
            control: null,
            clock: null,
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
        this.meshList = [];
        this.sizeList = [];
        this.step = 0;
        this.name = {
            imageList: {},
            promiseList: []
        }
    }
    init(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
        this.canvas = canvas;
        this.setSize();
        // カメラを作成
        this.three.camera = this.initCamera();
        // カメラをシーンに追加
        this.three.scene.add(this.three.camera);

        // ビューポート計算
        this.viewport = this.initViewport();
        // メッシュを作成
        // this.three.object = this.initMesh();
        this.initImage(ctx);

        // レンダラーを作成
        // this.three.renderer = this.initRenderer();

        // this.initStars();
        // メッシュをシーンに追加
        // this.three.scene.add(this.three.object);
        // カメラを制御
        // this.three.control = new OrbitControls(this.three.camera, this.three.renderer.domElement);
        // this.three.control.enableDamping = true;
        this.elemInfo.current = this.three.camera.position.z;
        this.test();
        // this.update();

        this.three.clock = new THREE.Clock();
        this.three.clock.start();

        window.addEventListener('wheel', (e) => {
            this.setWheel(e);
        });
        this.handleEvent();
        window.addEventListener(
            'resize',
            throttle(() => {
                this.handleResize();
            }, 100),
            false
        );
    }
    initCamera(): THREE.PerspectiveCamera {
        const camera = new THREE.PerspectiveCamera(
            45, // 画角
            this.winSize.width / this.winSize.height, // 縦横比
            0.1, // 視点から最も近い面までの距離
            2000 // 視点から最も遠い面までの距離
        );
        camera.position.set(0, 0, 1000);
        // どの位置からでも指定した座標に強制的に向かせることができる命令
        camera.lookAt(this.three.scene.position);
        return camera;
    }
    initStars() {
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.name.imageList.position, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(this.name.imageList.color, 3));
        geometry.setAttribute('alpha', new THREE.Float32BufferAttribute(this.name.imageList.alpha, 1));
        const material = new THREE.RawShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            // ブレンドモード: AdditiveBlending➡加算合成
            // blending: THREE.AdditiveBlending,
            // 陰面処理を有効化するかのフラグ。陰面処理とは "ある視点から見えない部分の面を消去する" という処理のこと。
            // depthTest: true
        });
        this.three.stars = new Points(geometry, material);
        const object = new THREE.Object3D();
        this.three.object = object.add(this.three.stars);
        this.three.scene.add(this.three.object);
        this.three.renderer = this.initRenderer();
    }
    initRenderer(): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true, // 物体の輪郭を滑らかにする
        });
        /**
         * デスクトップでは、メインディスプレイ・サブディスプレイでPixelRatioの異なる可能性がある。
         * ➡ リサイズイベントでsetPixelRatioメソッドでを使って更新
         * https://ics.media/tutorial-three/renderer_resize/
         */
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(new THREE.Color(0xeaf2f5), 0);
        renderer.setSize(this.winSize.width, this.winSize.height);
        this.wrapper = document.querySelector('.p-mv__title');
        this.wrapper.appendChild(renderer.domElement);
        return renderer;
    }
    initViewport(): ThreeNumber {
        if (this.three.camera) {
            // fov : Field OF View (カメラの位置から見えるシーンの範囲)
            // 角度をラジアンに変更
            const fov = this.three.camera.fov * (Math.PI / 180);
            // https://kou.benesse.co.jp/nigate/math/a14m0313.html
            // tanΘ(高さの半分 / 奥行) * 奥行 * 2
            const height = Math.tan(fov / 2) * this.three.camera.position.z * 2;
            const width = height * this.three.camera.aspect;
            this.viewport = {
                width,
                height,
            };
        }
        return this.viewport;
    }
    initImage(_: CanvasRenderingContext2D) {
        // this.context.ctx = ctx;
        this.image.el = new Image();
        this.image.el.src = require("../../imgs/pc/name.png");
        this.image.el.crossOrigin = "anonymous";
        this.image.el.addEventListener('load', async () => {
            await this.renderImage();
        });
    }
    // eslint-disable-next-line require-await
    async renderImage(): Promise<void> {
        this.canvas = document.createElement("canvas");
        this.context.ctx = this.canvas.getContext("2d");
        // Canvasサイズ設定
        this.canvas.width = this.winSize.width;
        this.canvas.height = this.winSize.height;

        this.context.ctx.fillStyle = "#ffffff";
        this.context.ctx.fillText('Nakamura', 0, 0, 100);
        // const data = this.context.ctx.getImageData(0, 0, 100, 30).data;
        this.context.ctx.fill();
        const texture = new THREE.Texture(this.canvas)
        texture.needsUpdate = true;

        // 実際の画像サイズ設定
        // this.image.width = this.image.el.width;
        // this.image.height = this.image.el.height;
        // // リサイズ後画像サイズ設定
        // const width = this.winSize.width;
        // const height = this.winSize.width * (this.image.height / this.image.width);
        // this.context.ctx.drawImage(this.image.el, 0, 0, this.image.width, this.image.height, 0, 0, width, height);
        // const imageData = this.context.ctx.getImageData(0, 0, width, height);
        // const data = imageData.data;
        // const position = [];
        // const color = [];
        // const alpha = [];
        // for (let y = 0; y < height; y += 5.0) {
        //     for (let x = 0; x < width; x += 5.0) {
        //         const index = (y * width + x) * 4;
        //         const r = data[index] / 255;
        //         const g = data[index + 1] / 255;
        //         const b = data[index + 2] / 255;
        //         const a = data[index + 3] / 255;
        //         const pX = x - width / 2;
        //         const pY = -(y - height / 2);
        //         const pZ = 0;
        //         a > 0 ? color.push(1.0, 0.0, 1.0) : color.push(r, g, b);
        //         // if (a !== 0) {
        //         //     color.push(1.0, 0.0, 1.0);
        //         // } else {
        //         //     color.push(r, g, b);
        //         // }
        //         position.push(pX, pY, pZ);
        //         alpha.push(a);
        //     }
        // }
        // this.name.imageList = {
        //     position,
        //     color,
        //     alpha
        // }
        // this.initStars();
    }
    scroll(): void {
        window.addEventListener('wheel', (e) => {
            this.setWheel(e);
        });
    }
    setWheel(e: WheelEvent) {
        if (this.three.camera) {
            this.elemInfo.current -= e.deltaY * 0.07;
        }
        const LENGTH = name.length;
        for (let i = 0; i < LENGTH; i += 2) {
            let positonX;
            let positonY;
            if (i < 192) {
                positonX = name[i];
                positonY = name[i + 1];
            } else {
                positonX = name[i] - 35;
                positonY = name[i + 1] + 6;
            }
            const tl = gsap.timeline();
            const index = i - i / 2;
            tl.to(this.meshList[index].position, {
                x: positonX,
                y: -positonY,
                z: 10,
                duration: Math.random() * 2,
            });
        }
    }
    test(): void {
        if (this.three.camera) {
            this.elemInfo.ease = parseFloat('0.1');
            this.elemInfo.previous = lerp(this.elemInfo.previous, this.elemInfo.current, this.elemInfo.ease);
            this.elemInfo.previous = Math.floor(this.elemInfo.previous * 100) / 100;
            const tl = gsap.timeline();
            const diff = Math.abs(this.three.camera.position.z) - Math.abs(this.elemInfo.current);
            if (Math.abs(diff) > 0) {
                if (diff > 0) {
                    tl.to(this.three.camera.position, {
                        z: this.elemInfo.previous,
                        duration: 0,
                        delay: 0,
                        ease: Power2.easeInOut,
                    });
                } else {
                    tl.to(this.three.camera.position, {
                        z: this.elemInfo.previous,
                        duration: 0,
                        delay: 0,
                        ease: Power2.easeInOut,
                    });
                }
            }
        }
        requestAnimationFrame(this.test.bind(this));
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
        if (this.three.object) this.updateObject();
    }
    updateObject(): void {
        this.three.object.scale.x = this.winSize.width / this.canvas.width;
        this.three.object.scale.y = this.winSize.width / this.canvas.width;
    }
    render(): void {
        requestAnimationFrame(this.render.bind(this));
        if (this.three.clock) {
            // delta: 変化量
            this.time.delta = this.three.clock.getDelta();
            this.time.total += this.time.delta;
        }
        // 画面に描画する
        if (this.three.renderer && this.three.camera) this.three.renderer.render(this.three.scene, this.three.camera);

        this.step++;
        const sizes = this.three.stars?.geometry.attributes.size;
        if (sizes) {
            for (let i = 0; i < sizes.array.length; i++) {
                // sizes.array[i] = this.sizeList[i] * (1 + Math.sin(0.1 * i + this.step * 0.025));

            }
            sizes.needsUpdate = true;
        }
    }
}