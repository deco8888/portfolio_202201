import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap, { Power2 } from 'gsap';
import { BufferGeometry, Points } from 'three';
import vertexShader from '../glsl/vertexshader.vert';
import fragmentShader from '../glsl/fragmentShader.frag';
import starVertexShader from '../glsl/star/vertexshader.vert';
import starFragmentShader from '../glsl/star/fragmentShader.frag';
import { throttle } from '../utils/throttle';
import { lerp } from '../utils/math';
import { name } from '../const/name';
// import { BufferGeometry, Points } from 'three';

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
    three: {
        camera: THREE.PerspectiveCamera | null;
        scene: THREE.Scene;
        mesh: THREE.Mesh | null;
        stars: THREE.Points | null;
        renderer: THREE.WebGLRenderer | null;
        object: THREE.Object3D | null;
        // control: OrbitControls | null;
        clock: THREE.Clock | null;
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
    constructor() {
        this.three = {
            camera: null,
            scene: new THREE.Scene(),
            mesh: null,
            stars: null,
            renderer: null,
            object: null,
            // control: null,
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
    }
    init(canvas: HTMLCanvasElement): void {
        if(!canvas) canvas = document.querySelector(".p-index__canvas");
        this.setSize();
        // カメラを作成
        this.three.camera = this.initCamera();
        // カメラをシーンに追加
        this.three.scene.add(this.three.camera);
        // レンダラーを作成
        this.three.renderer = this.initRenderer(canvas);
        // HTMLに追加
        canvas.appendChild(this.three.renderer.domElement);
        // ビューポート計算
        this.viewport = this.initViewport();
        // メッシュを作成
        this.three.object = this.initMesh();
        this.initStars();
        // メッシュをシーンに追加
        this.three.scene.add(this.three.object);
        // カメラを制御
        // this.three.control = new OrbitControls(this.three.camera, this.three.renderer.domElement);
        // this.three.control.enableDamping = true;
        this.elemInfo.current = this.three.camera.position.z;
        // 描写する
        this.render();
        this.test();
        this.update();

        this.three.clock = new THREE.Clock();
        this.three.clock.start();

        window.addEventListener('wheel', (e) => {
            this.setWheel(e);
        });
    }
    initCamera(): THREE.PerspectiveCamera {
        const camera = new THREE.PerspectiveCamera(
            45, // 画角
            this.winSize.width / this.winSize.height, // 縦横比
            1, // 視点から最も近い面までの距離
            100000 // 視点から最も遠い面までの距離
        );
        camera.position.set(0, 0, 50);
        // どの位置からでも指定した座標に強制的に向かせることができる命令
        camera.lookAt(this.three.scene.position);
        return camera;
    }
    initStars() {
        const LENGTH = 4000;
        const TOTAL = 30000;
        const SIZE = 5.0;
        const vertices = [];
        // const colors = [];
        for (let i = 0; i < LENGTH; i++) {
            const positonX = TOTAL * (Math.random() - 0.5);
            const positonY = TOTAL * (Math.random() - 0.5);
            const positonZ = TOTAL * -Math.abs(Math.random() - 0.2);
            vertices.push(positonX, positonY, positonZ);

            const size = SIZE * Math.abs(Math.random() - 0.5);
            this.sizeList.push(size);
            // const r = Math.random() - 0.5;
            // const b = Math.random() - 0.5;
            // const g = Math.random() - 0.5;
            // colors[i * 3] = r;
            // colors[i * 3 + 1] = b;
            // colors[i * 3 + 2] = g;
        }
        // 形状データを作成
        // const geometry = new THREE.PlaneBufferGeometry(1, 1);
        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(this.sizeList, 1));
        const stars = require("~/assets/images/pc/star.png");
        const uniforms = {
            uTex: {
                type: "t",
                value: new THREE.TextureLoader().load(stars)
            },
            // uPointSize: {
            //     type: "f",
            //     value: 2.0
            // }
        }
        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: starVertexShader,
            fragmentShader: starFragmentShader,
            transparent: true,
            opacity: 0.3,
            // ブレンドモード: AdditiveBlending➡加算合成
            blending: THREE.AdditiveBlending,
            // 陰面処理を有効化するかのフラグ。陰面処理とは "ある視点から見えない部分の面を消去する" という処理のこと。
            depthTest: true
        });
        // const mesh = new THREE.Mesh(geometry, material);
        this.three.stars = new Points(geometry, material);
        // const object = new THREE.Object3D();
        // object.add(mesh);
        this.three.scene.add(this.three.stars);
    }
    initRenderer(_: HTMLCanvasElement): THREE.WebGLRenderer {
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
        renderer.setClearColor(0xeaf2f5, 0);
        renderer.setSize(this.winSize.width, this.winSize.height);
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
    initMesh(): THREE.Object3D {
        const uniforms = {
            uResolution: {
                value: new THREE.Vector2(window.innerWidth, window.innerHeight),
            },
            uShape: {
                value: new THREE.Vector2(2, 2),
            },
            // uProgress: {
            //     value: 1.0,
            // },
            // uSpeed: {
            //     value: 0.0,
            // },
            // uWave: {
            //     value: 0.0,
            // },
            // uTIme: {
            //     value: 0.0,
            // },
        };
        const LENGTH = name.length;
        const vertices = [];
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
            vertices.push(positonX, -positonY, 10);
        }
        // 形状データを作成
        // const geometry = new THREE.PlaneBufferGeometry(1, 1);
        const geometry = new BufferGeometry();

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        // geometry.setAttribute('color', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.ShaderMaterial({
            // eslint-disable-next-line object-shorthand
            uniforms: uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
        });
        // const material = new THREE.MeshBasicMaterial({
        //     // 三角形の表と裏の両面を描画する指定
        //     side: THREE.DoubleSide,
        //     transparent: true,
        //     color: 0xffff00,
        //     opacity: 0.6,
        // });
        // this.three.mesh = new THREE.Mesh(geometry, material);
        const mesh = new Points(geometry, material);
        const object = new THREE.Object3D();
        object.add(mesh);
        // const object = new THREE.Object3D();
        // for (let i = 0; i < LENGTH; i += 2) {
        //     // this.three.mesh = new THREE.Mesh(geometry, material);
        //     const positionX = Math.random() * 10 - 10;
        //     const positionY = Math.random() * 10 - 10;
        //     const positionZ = Math.random() * 10 - 10;
        //     this.three.mesh.position.set(positionX, -positionY, positionZ);
        //     this.meshList.push(this.three.mesh);
        //     object.add(this.three.mesh);
        // }
        this.elemInfo = {
            object,
            current: 0,
            previous: 0,
            ease: 0.1,
            parallax: 1,
        };
        return object;
    }
    update(): void { }
    scroll(): void {
        window.addEventListener('wheel', (e) => {
            this.setWheel(e);
        });
    }
    setWheel(e: WheelEvent) {
        if (this.three.camera) {
            this.elemInfo.current += e.deltaY * 0.07;
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
            const diff = this.three.camera.position.z - this.elemInfo.current;
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
        // if (this.three.mesh) {
        //     const material = this.three.mesh.material;
        // }
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
        const geometry = <THREE.BufferGeometry>this.three.stars?.geometry;
        // const sizes = geometry.attributes.size;
        // if (sizes) {
        //     for(const [index, size] of Object.entries(sizes.array)) {
        //         size = size * (1 + Math.sin(0.1 * parseInt(index) + this.step * 0.025));
        //     }
        //     sizes.needsUpdate = true;
        // }
    }
}

// eslint-disable-next-line no-new
// new Webgl();
