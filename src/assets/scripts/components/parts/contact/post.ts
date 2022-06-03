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
import gsap from 'gsap';
// import { GUI } from 'dat.gui';

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
        // HTMLに追加
        this.canvas = canvas;
        this.canvas.appendChild(this.three.renderer.domElement);
        // ビューポート計算
        this.viewport = this.initViewport();
        this.createModels();
        this.initAmbientLight();
        this.initDirectionalLight();
        // ポイントライトを作成
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
        const pointLight = new PointLight('#ffffff', 2.6);
        this.three.pointLight = pointLight;
        this.three.pointLight.position.set(0, 0, 1000);
        this.three.scene.add(this.three.pointLight);
    }
    initDirectionalLight(): void {
        // DirectionalLight(色, 光の強さ)
        // 特定の方向に放射される光。光源は無限に離れているものとして、そこから発生する光線はすべて平行になる。
        // ※平行光源
        const directionalLight = new DirectionalLight('#ffffff', 2.0);
        this.three.directionalLight = directionalLight;
        this.three.directionalLight.position.set(0, 1, 1000);
        this.three.scene.add(this.three.directionalLight);
    }
    initSpotLight(): void {
        // DirectionalLight(色, 光の強さ)
        // 特定の方向に放射される光。光源は無限に離れているものとして、そこから発生する光線はすべて平行になる。
        // ※平行光源
        const spotLight = new SpotLight('#ffffff', 1.0);
        this.three.spotLight = spotLight;
        this.three.spotLight.position.set(0, 1, 1000);
        this.three.scene.add(this.three.spotLight);
    }
    createModels(): void {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/draco/');
        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);
        const objSrc = '/draco/objs/post_d.glb';
        gltfLoader.load(objSrc, (obj) => {
            // const children = [...obj.scene.children];
            // for (const child of children) {
            //     // child.scale.set(1, 1, 1);
            //     this.three.object.add(child);
            // }
            this.three.object.add(obj.scene);
            this.three.object.position.set(-5, -4, 985);
            // atan2：点 (0, 0) から点 (x, y) までの半直線と、正の x 軸の間の平面上での角度 (ラジアン単位) を返すs
            const angle = Math.atan2(this.three.object.position.y, this.three.object.position.x);
            this.three.object.rotateY(angle * 1.1);
            this.render();
            this.three.object.scale.set(0, 0, 0);
        });
    }
    setModels(): void {
        this.three.scene.add(this.three.object);
        gsap.to(this.three.object.scale, {
            duration: 1,
            delay: 0.3,
            x: 1,
            y: 1,
            z: 1,
        });
    }
    render(): void {
        const elapsedTime = this.three.clock.getElapsedTime();
        this.three.object.position.y += Math.sin(elapsedTime) * 0.0025;
        this.three.object.rotation.x += Math.cos(elapsedTime) * 0.0008;
        this.three.object.rotation.y += Math.sin(elapsedTime) * 0.0008;
        // 画面に描画する
        this.three.renderer.render(this.three.scene, this.three.camera);
        requestAnimationFrame(this.render.bind(this));
    }
    initGui(): void {
        // this.gui = new GUI();
        // // GUIにパラメータ設定
        // if (this.three.camera) {
        //     this.gui.add(this.three.camera.position, 'x').min(-5).max(5).step(1).name('cameraX');
        //     this.gui.add(this.three.camera.position, 'y').min(-5).max(5).step(1).name('cameraY');
        //     this.gui.add(this.three.camera.position, 'z').min(-10).max(1000).step(1).name('cameraZ');
        // }
        // this.gui.add({ intensity: 1 }, 'intensity', 0, 5).onChange((e) => {
        //     this.three.ambientLight.intensity = e;
        // });
        // this.gui.add({ intensity: 1 }, 'intensity', 0, 5).onChange((e) => {
        //     this.three.directionalLight.intensity = e;
        // });
        // this.gui.add({ intensity: 1 }, 'intensity', 0, 5).onChange((e) => {
        //     this.three.pointLight.intensity = e;
        // });
        // this.gui.add({ intensity: 1 }, 'intensity', 0, 5).onChange((e) => {
        //     this.three.spotLight.intensity = e;
        // });
        // if (this.three.ambientLight) {
        //     this.gui.add(this.three.ambientLight.position, 'x').min(-5).max(5).step(1).name('spotLightX');
        //     this.gui.add(this.three.ambientLight.position, 'y').min(-5).max(5).step(1).name('spotLightY');
        //     this.gui.add(this.three.ambientLight.position, 'z').min(900).max(1500).step(1).name('spotLightZ');
        // }
        // if (this.three.directionalLight) {
        //     this.gui.add(this.three.directionalLight.position, 'x').min(-5).max(5).step(1).name('lightX');
        //     this.gui.add(this.three.directionalLight.position, 'y').min(-5).max(5).step(1).name('lightY');
        //     this.gui.add(this.three.directionalLight.position, 'z').min(-5).max(5).step(1).name('lightZ');
        //     this.gui.add(this.three.directionalLight.shadow.camera, 'top').min(-5).max(5).step(1).name('shadow top');
        //     this.gui.add(this.three.directionalLight.shadow.camera, 'left').min(-5).max(5).step(1).name('shadow left');
        //     this.gui
        //         .add(this.three.directionalLight.shadow.camera, 'right')
        //         .min(-5)
        //         .max(5)
        //         .step(1)
        //         .name('shadow right');
        //     this.gui
        //         .add(this.three.directionalLight.shadow.camera, 'bottom')
        //         .min(-5)
        //         .max(5)
        //         .step(1)
        //         .name('shadow bottom');
        // }
        // if (this.three.pointLight) {
        //     this.gui.add(this.three.pointLight.position, 'x').min(-5).max(5).step(1).name('helperLightX');
        //     this.gui.add(this.three.pointLight.position, 'y').min(-5).max(5).step(1).name('helperLightY');
        //     this.gui.add(this.three.pointLight.position, 'z').min(900).max(1000).step(1).name('helperLightZ');
        //     this.gui.add(this.three.pointLight.scale, 'x').min(-5).max(5).step(1).name('helperScaleX');
        //     this.gui.add(this.three.pointLight.scale, 'y').min(-5).max(5).step(1).name('helperScaleY');
        //     this.gui.add(this.three.pointLight.scale, 'z').min(-5).max(5).step(1).name('helperScalesZ');
        // }
        // if (this.three.pointLight) {
        //     this.gui.add(this.three.spotLight.position, 'x').min(-5).max(5).step(1).name('spotLightX');
        //     this.gui.add(this.three.spotLight.position, 'y').min(-5).max(5).step(1).name('spotLightY');
        //     this.gui.add(this.three.spotLight.position, 'z').min(900).max(1500).step(1).name('spotLightZ');
        // }
        // if (this.three.object) {
        //     this.gui.add(this.three.object.position, 'x').min(-5).max(5).step(1).name('positionX');
        //     this.gui.add(this.three.object.position, 'y').min(-5).max(5).step(1).name('positionY');
        //     this.gui.add(this.three.object.position, 'z').min(980).max(1000).step(1).name('positionZ');
        //     this.gui.add(this.three.object.rotation, 'x').min(-5).max(5).step(1).name('rotationX');
        //     this.gui.add(this.three.object.rotation, 'y').min(-5).max(5).step(1).name('rotationY');
        //     this.gui.add(this.three.object.rotation, 'z').min(-5).max(5).step(1).name('rotationZ');
        // }
    }
}
