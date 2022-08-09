import {
    PerspectiveCamera,
    Scene,
    BufferGeometry,
    Mesh,
    Points,
    Object3D,
    WebGLRenderer,
    Clock,
    Raycaster,
    Vector2,
    PointLight,
    AmbientLight,
    DirectionalLight,
    DirectionalLightHelper,
    SpotLight,
    SpotLightHelper,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import Webgl from '../../webgl';
import gsap, { Power2 } from 'gsap';
import { radians } from '~/assets/scripts/utils/helper';
import { GUI } from 'dat.gui';
import { addClass, removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';
import { throttle } from '~/assets/scripts/utils/throttle';
import { isMobile } from '../../isMobile';

interface ThreeNumber {
    [key: string]: number;
}

export default class Post extends Webgl {
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
        ambientLight: THREE.AmbientLight | null;
        directionalLight: DirectionalLight | null;
        directionalLightHelper: DirectionalLightHelper | null;
        spotLight: SpotLight | null;
        spotLightHelper: SpotLightHelper | null;
    };
    raycaster: Raycaster;
    winSize: ThreeNumber;
    time: ThreeNumber;
    viewport!: ThreeNumber;
    flg: {
        isMove: boolean;
    };
    canvas: HTMLElement;
    ctx: CanvasRenderingContext2D;
    animFrame?: number;
    mouse: THREE.Vector2;
    gui: GUI;
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
            object: new Object3D(),
            renderer: null,
            clock: null,
            pointLight: null,
            ambientLight: null,
            directionalLight: null,
            directionalLightHelper: null,
            spotLight: null,
            spotLightHelper: null,
        };
        this.raycaster = new Raycaster();
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
        this.animFrame = 0;
        this.mouse = new Vector2();
        this.isMobile = isMobile();
        // this.gui = new GUI();
        // this.init();
    }
    async init(canvas: HTMLElement): Promise<void> {
        // 画面サイズを取得
        this.setSize();
        // カメラを作成
        this.three.camera = this.initCamera();
        // カメラをシーンに追加
        this.three.scene.add(this.three.camera);
        // レンダラーを作成
        this.three.renderer = this.initRenderer();
        this.three.renderer.shadowMap.enabled = true;
        // HTMLに追加
        this.canvas = canvas;
        this.canvas.appendChild(this.three.renderer.domElement);
        // ビューポート計算
        this.viewport = this.initViewport();
        this.createModels();
        this.initAmbientLight();
        this.initDirectionalLight();
        // // ポイントライトを作成
        this.initPointLight();
        this.initSpotLight();

        this.three.clock = new Clock();
        this.three.clock.start();
    }
    initAmbientLight(): void {
        // ■AmbientLight(色, 光の強さ)
        // 環境光源を実現する。3D空間全体に均等に光を当てる。一律に明るくしたいときに使う。
        // ※陰影や影(cast shadow)ができないので、この光源だけだと立体感を表現することはできない。
        const ambientLight = new AmbientLight('#ffffff', 1.0);
        this.three.ambientLight = ambientLight;
        this.three.scene.add(this.three.ambientLight);
    }
    initPointLight(): void {
        // decay: 光源からの光の減衰
        const pointLight = new PointLight('#ffffff', 2.6, 50, 0.5);
        this.three.pointLight = pointLight;
        this.three.pointLight.castShadow = true;
        this.three.pointLight.position.set(0, 0, 985);
        this.three.scene.add(this.three.pointLight);
    }
    initDirectionalLight(): void {
        // DirectionalLight(色, 光の強さ)
        // 特定の方向に放射される光。光源は無限に離れているものとして、そこから発生する光線はすべて平行になる。
        // ※平行光源
        const directionalLight = new DirectionalLight('#ffffff', 2.0);
        this.three.directionalLight = directionalLight;
        this.three.directionalLight.castShadow = true;
        this.three.directionalLight.shadow.camera.top = -12;
        this.three.directionalLight.shadow.camera.left = -12;
        this.three.directionalLight.shadow.camera.right = 12;
        this.three.directionalLight.shadow.camera.bottom = 12;
        this.three.directionalLight.position.set(0, 1, 9);
        this.three.scene.add(this.three.directionalLight);
    }
    initSpotLight(): void {
        // DirectionalLight(色, 光の強さ)
        // 特定の方向に放射される光。光源は無限に離れているものとして、そこから発生する光線はすべて平行になる。
        // ※平行光源
        const spotLight = new SpotLight('#ffffff', 3.0);
        this.three.spotLight = spotLight;
        this.three.spotLight.castShadow = true;
        this.three.spotLight.intensity = 3.0;
        const posX = this.isMobile ? 1.5 : 0;
        this.three.spotLight.position.set(posX, -3, 990);
        const scale = this.isMobile ? 1 : 2;
        this.three.spotLight.scale.set(scale, scale, scale);
        this.three.spotLightHelper = new SpotLightHelper(this.three.spotLight);
        // this.three.spotLightHelper.add(this.three.spotLight);
        this.three.scene.add(this.three.spotLight);
    }
    createModels(): void {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);
        const objSrc = '/draco/objs/post.glb';
        gltfLoader.load(objSrc, (obj) => {
            // const children = [...obj.scene.colle];
            // for (const child of children) {
            //     console.log(child);
            //     // child.scale.set(1, 1, 1);
            //     this.three.object.add(child);
            // }
            obj.scene.castShadow = true;
            obj.scene.receiveShadow = true;
            const scale = this.isMobile ? 0.7 : 1.1;
            this.isMobile ? obj.scene.scale.set(scale, scale, scale) : obj.scene.scale.set(scale, scale, scale);
            this.three.object.add(obj.scene);
            const posY = this.isMobile ? -2 : -3;
            this.three.object.position.set(0, posY, 985);
            // atan2：点 (0, 0) から点 (x, y) までの半直線と、正の x 軸の間の平面上での角度 (ラジアン単位) を返す
            // const angle = Math.atan2(this.three.object.position.y, this.three.object.position.x);
            const angleX = this.isMobile ? radians(6) : radians(10);
            this.three.object.rotation.set(angleX, radians(180), 0);
            this.render();
        });
    }
    setModels(): void {
        // this.initGui();
        this.three.scene.add(this.three.object);
        this.render();
        // addClass(this.canvas, hasClass.active);
        // gsap.to(this.three.object.scale, {
        //     onUpdate: () => this.render(),
        //     duration: 1,
        //     delay: 0.7,
        //     ease: Power2.easeOut,
        //     x: 1.1,
        //     y: 1.1,
        //     z: 1.1,
        // });
    }
    removeModels(): void {
        removeClass(this.canvas, hasClass.active);
        setTimeout(() => {
            this.three.scene.remove(this.three.object);
            this.render();
        }, 1000);
        // gsap.to(this.three.object.scale, {
        //     onUpdate: () => this.render(),
        //     duration: 0.5,
        //     delay: 0.3,
        //     ease: Power2.easeOut,
        //     x: 0,
        //     y: 0,
        //     z: 0,
        //     onComplete: () => {
        //         this.three.scene.remove(this.three.object);
        //     },
        // });
    }
    render(): void {
        // const elapsedTime = this.three.clock.getElapsedTime();
        // this.three.object.position.y += Math.sin(elapsedTime) * 0.0025;
        // this.three.object.rotation.x += Math.cos(elapsedTime) * 0.0008;
        // this.three.object.rotation.y += Math.sin(elapsedTime) * 0.0008;
        // 画面に描画する
        this.three.renderer.render(this.three.scene, this.three.camera);
        // requestAnimationFrame(this.render.bind(this));
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
        this.initViewport();
        if (this.three.camera) {
            this.three.object.position.set(0, -3, 985);
            // カメラのアスペクト比を正す
            this.three.camera.aspect = this.winSize.width / this.winSize.height;
            this.three.camera.updateProjectionMatrix();
            if (this.three.renderer) {
                this.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.three.renderer.setSize(this.winSize.width, this.winSize.height);
            }
        }
        this.render();
    }
    initGui(): void {
        // this.gui = new GUI();
        // GUIにパラメータ設定
        if (this.three.camera) {
            this.gui.add(this.three.camera.position, 'x').min(-5).max(5).step(1).name('cameraX');
            this.gui.add(this.three.camera.position, 'y').min(-5).max(5).step(1).name('cameraY');
            this.gui.add(this.three.camera.position, 'z').min(-10).max(1000).step(1).name('cameraZ');
        }
        this.gui.add({ intensity: 1 }, 'intensity', 0, 5).onChange((e) => {
            this.three.ambientLight.intensity = e;
        });
        this.gui.add({ intensity: 1 }, 'intensity', 0, 5).onChange((e) => {
            this.three.directionalLight.intensity = e;
        });
        this.gui.add({ intensity: 1 }, 'intensity', 0, 5).onChange((e) => {
            this.three.pointLight.intensity = e;
        });
        this.gui.add({ intensity: 1 }, 'intensity', 0, 5).onChange((e) => {
            this.three.spotLight.intensity = e;
        });
        if (this.three.directionalLight) {
            this.gui.add(this.three.directionalLight.position, 'x').min(-5).max(5).step(1).name('lightX');
            this.gui.add(this.three.directionalLight.position, 'y').min(-5).max(5).step(1).name('lightY');
            this.gui.add(this.three.directionalLight.position, 'z').min(-5).max(1500).step(1).name('lightZ');
            this.gui.add(this.three.directionalLight.shadow.camera, 'top').min(-5).max(50).step(1).name('shadow top');
            this.gui.add(this.three.directionalLight.shadow.camera, 'left').min(-5).max(50).step(1).name('shadow left');
            this.gui
                .add(this.three.directionalLight.shadow.camera, 'right')
                .min(-5)
                .max(50)
                .step(1)
                .name('shadow right');
            this.gui
                .add(this.three.directionalLight.shadow.camera, 'bottom')
                .min(-5)
                .max(50)
                .step(1)
                .name('shadow bottom');
            this.gui
                .add(this.three.directionalLight.shadow.mapSize, 'width')
                .min(-5)
                .max(50)
                .step(1)
                .name('mapSize.width');
            this.gui
                .add(this.three.directionalLight.shadow.mapSize, 'height')
                .min(-5)
                .max(50)
                .step(1)
                .name('mapSize.height');
        }
        if (this.three.pointLight) {
            this.gui.add(this.three.pointLight.position, 'x').min(-5).max(5).step(1).name('helperLightX');
            this.gui.add(this.three.pointLight.position, 'y').min(-5).max(5).step(1).name('helperLightY');
            this.gui.add(this.three.pointLight.position, 'z').min(900).max(1000).step(1).name('helperLightZ');
            this.gui.add(this.three.pointLight.scale, 'x').min(-5).max(5).step(1).name('helperScaleX');
            this.gui.add(this.three.pointLight.scale, 'y').min(-5).max(5).step(1).name('helperScaleY');
            this.gui.add(this.three.pointLight.scale, 'z').min(-5).max(5).step(1).name('helperScalesZ');
            this.gui.add(this.three.pointLight, 'decay').min(-5).max(5).step(1).name('decay');
        }
        if (this.three.spotLight) {
            this.gui.add(this.three.spotLight.position, 'x').min(-5).max(5).step(1).name('spotLightX');
            this.gui.add(this.three.spotLight.position, 'y').min(-5).max(5).step(1).name('spotLightY');
            this.gui.add(this.three.spotLight.position, 'z').min(0).max(1500).step(1).name('spotLightZ');
            this.gui.add(this.three.spotLight.scale, 'x').min(-5).max(5).step(1).name('spotLightScaleX');
            this.gui.add(this.three.spotLight.scale, 'y').min(-5).max(5).step(1).name('spotLightScaleY');
            this.gui.add(this.three.spotLight.scale, 'z').min(-5).max(5).step(1).name('spotLightScaleZ');
            this.gui.add(this.three.spotLight, 'angle').min(-5).max(5).step(0.1).name('angle');
        }
        if (this.three.object) {
            this.gui.add(this.three.object.position, 'x').min(-5).max(5).step(1).name('positionX');
            this.gui.add(this.three.object.position, 'y').min(-5).max(5).step(1).name('positionY');
            this.gui.add(this.three.object.position, 'z').min(980).max(1000).step(1).name('positionZ');
            this.gui.add(this.three.object.rotation, 'x').min(-5).max(5).step(1).name('rotationX');
            this.gui.add(this.three.object.rotation, 'y').min(-5).max(5).step(1).name('rotationY');
            this.gui.add(this.three.object.rotation, 'z').min(-5).max(5).step(1).name('rotationZ');
        }
    }
}
