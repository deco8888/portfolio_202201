import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap, { Power2 } from 'gsap';
import { BufferGeometry, Float32BufferAttribute, Points, Vector2 } from 'three';
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

interface UniformsType {
    [key: string]: {
        type: string;
        value: number | Vector2;
    };
}

interface MaterialType {
    [key: string]: UniformsType;
}

export default class Webgl {
    canvas: HTMLCanvasElement;
    wrapper: HTMLElement;
    context: {
        ctx: CanvasRenderingContext2D;
    };
    image: {
        el: HTMLImageElement;
        width: number;
        height: number;
    };
    display: {
        width: number;
        height: number;
    };
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
            [key: string]: number[];
        };
        promiseList: [];
    };
    fontSize: number;
    mouse: Vector2;
    constructor() {
        this.canvas = null;
        this.context = {
            ctx: null,
        };
        this.image = {
            el: null,
            width: 0,
            height: 0,
        };
        this.display = {
            width: 0,
            height: 0,
        };
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
            promiseList: [],
        };
        this.fontSize = 150;
        this.mouse = new Vector2(0.5, 0.5);
    }
    init(): void {
        this.setSize();
        // カメラを作成
        this.three.camera = this.initCamera();
        // カメラをシーンに追加
        this.three.scene.add(this.three.camera);

        // ビューポート計算
        this.viewport = this.initViewport();
        // メッシュを作成
        // this.three.object = this.initMesh();
        this.initImage();

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

        // window.addEventListener('wheel', (e) => {
        //     this.setWheel(e);
        // });
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
        camera.position.set(0, 0, 1400);
        // どの位置からでも指定した座標に強制的に向かせることができる命令
        camera.lookAt(this.three.scene.position);
        return camera;
    }
    initStars() {
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.name.imageList.position, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(this.name.imageList.color, 3));
        geometry.setAttribute('alpha', new THREE.Float32BufferAttribute(this.name.imageList.alpha, 1));

        const randomList = [];
        const vertices = this.name.imageList.position.length / 3;
        for (let i = 0; i < vertices; i++) {
            randomList.push((Math.random() - 1.0) * 2.0, (Math.random() - 1.0) * 2.0);
            geometry.setAttribute('random', new Float32BufferAttribute(randomList, 2));
        }

        const uniforms: UniformsType = {
            uAspect: {
                type: 'f',
                value: this.winSize.width / this.winSize.height,
            },
            uRatio: {
                type: 'f',
                value: 0.0,
            },
            uTime: {
                type: 'f',
                value: 0.0,
            },
            uMouse: {
                type: 'v2',
                value: this.mouse,
            },
        };

        const material = new THREE.RawShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: uniforms,
            transparent: true,
            // ブレンドモード: AdditiveBlending➡加算合成
            // blending: THREE.AdditiveBlending,
            // 陰面処理を有効化するかのフラグ。陰面処理とは "ある視点から見えない部分の面を消去する" という処理のこと。
            // depthTest: true
        });
        this.three.stars = new Points(geometry, material);
        console.log(material);
        const object = new THREE.Object3D();
        this.three.object = object.add(this.three.stars);
        this.three.scene.add(this.three.stars);
        this.three.renderer = this.initRenderer();

        const starsMaterial = this.three.stars.material as any as MaterialType;
        console.log(starsMaterial.uniforms.uRatio);
        gsap.to(starsMaterial.uniforms.uRatio, {
            value: 1.0,
            duration: 1.8,
            ease: Power2.easeInOut,
            repeat: 1,
            yoyo: true,
        });
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
            // tanΘ(角度 / 2) * 奥行 * 2
            const height = Math.tan(fov / 2) * this.three.camera.position.z * 2;
            const width = height * this.three.camera.aspect;
            this.viewport = {
                width,
                height,
            };
        }
        return this.viewport;
    }
    initImage() {
        this.image.el = new Image();
        this.image.el.src = require('../../imgs/pc/name.png');
        this.image.el.crossOrigin = 'anonymous';
        this.image.el.addEventListener('load', async () => {
            await this.renderImage();
        });
    }
    // eslint-disable-next-line require-await
    async renderImage(): Promise<void> {
        this.canvas = document.createElement('canvas');
        this.context.ctx = this.canvas.getContext('2d');

        // 実際の画像サイズ設定
        this.image.width = this.image.el.width;
        this.image.height = this.image.el.height;

        // リサイズ後画像サイズ設定
        this.display.width = window.innerWidth; // 0.08313679245283019
        this.display.height = this.display.width * (this.image.height / this.image.width);
        console.log(this.image.height / this.image.width);
        console.log(this.display.height / this.display.width);

        // Canvasサイズ設定
        this.canvas.width = this.display.width;
        this.canvas.height = this.display.height;

        this.context.ctx.drawImage(
            this.image.el,
            0,
            0,
            this.image.width,
            this.image.height,
            0,
            0,
            this.display.width,
            this.display.height
        );
        const imageData = this.context.ctx.getImageData(0, 0, this.display.width, this.display.height);
        const data = imageData.data;

        const position = [];
        const color = [];
        const alpha = [];

        for (let y = 0; y < this.display.height; y += 5) {
            for (let x = 0; x < this.display.width; x += 5) {
                const index = (y * this.display.width + x) * 4;
                const r = data[index] / 255;
                const g = data[index + 1] / 255;
                const b = data[index + 2] / 255;
                let a = data[index + 3] / 255;

                const pX = x - this.display.width / 2;
                const pY = -(y - this.display.height / 2);
                const pZ = 0;
                // a > 0 ? color.push(1.0, 0.0, 1.0) : color.push(r, g, b);
                if (a > 0.7) a = 0.6;
                // color.push(70 / 255, 93 / 255, 115 / 255);
                color.push(Math.random(), Math.max(Math.random() * 0.8, 0.5), Math.max(Math.random() * 0.9, 0.8));
                position.push(pX, pY, pZ);
                alpha.push(a);
            }
        }

        this.name.imageList = {
            position,
            color,
            alpha,
        };
        this.initStars();
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
        window.addEventListener('mousemove', (e: MouseEvent) => {
            this.moveMouse(e.clientX, e.clientY);
        });
        this.render();
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

        if (this.three.stars) {
            const starsMaterial = this.three.stars.material as any as MaterialType;
            let timeValue = starsMaterial.uniforms.uTime.value as number;
            timeValue += 0.01;
            starsMaterial.uniforms.uTime.value = timeValue;
        }
    }

    moveMouse(x: number, y: number) {
        this.mouse.x = x - this.winSize.width / 2;
        this.mouse.y = -y + this.winSize.height / 2;
    }
}
