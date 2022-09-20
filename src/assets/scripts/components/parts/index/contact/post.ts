import { Vector2, PointLight, AmbientLight, SpotLight } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import Webgl from '~/assets/scripts/modules/webgl';
import { radians } from '~/assets/scripts/utils/helper';
import { GUI } from 'dat.gui';
import { removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';
import { isMobile } from '~/assets/scripts/modules/isMobile';

interface ThreeNumber {
    [key: string]: number;
}

export default class Post extends Webgl {
    // raycaster: Raycaster;
    time: ThreeNumber;
    flg: {
        isMove: boolean;
    };
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    animFrame?: number;
    mouse: THREE.Vector2;
    gui: GUI;
    isMobile: boolean;
    constructor() {
        super();
        // this.raycaster = new Raycaster();
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
    }
    async init(canvas: HTMLCanvasElement): Promise<void> {
        this.canvas = canvas;
        // 画面サイズを取得
        this.setSize();
        // カメラを作成
        const el = this.canvas.closest('div');
        this.three.camera = this.initCamera({
            width: el.clientWidth,
            height: el.clientHeight,
            far: 100,
            position: {
                x: 0,
                y: 0,
                z: 90,
            },
        });
        // カメラをシーンに追加
        this.three.scene.add(this.three.camera);
        // レンダラーを作成
        this.three.renderer = this.initRenderer({
            canvas: this.canvas,
            width: el.clientWidth,
            height: el.clientHeight,
        });
        // this.three.renderer.shadowMap.enabled = true;
        // HTMLに追加
        // this.canvas.appendChild(this.three.renderer.domElement);
        // ビューポート計算
        this.viewport = this.initViewport();
        this.createModels();
        this.initAmbientLight();
        // this.initDirectionalLight();
        // ポイントライトを作成
        this.initPointLight();
        this.initSpotLight();
        // this.initGui();
    }
    initAmbientLight(): void {
        // ■AmbientLight(色, 光の強さ)
        // 環境光源を実現する。3D空間全体に均等に光を当てる。一律に明るくしたいときに使う。
        // ※陰影や影(cast shadow)ができないので、この光源だけだと立体感を表現することはできない。
        const ambientLight = new AmbientLight('#ffffff', 1.6);
        this.three.ambientLight = ambientLight;
        this.three.scene.add(this.three.ambientLight);
    }
    initPointLight(): void {
        // decay: 光源からの光の減衰
        const pointLight = new PointLight('#ffffff', 1.5);
        this.three.pointLight = pointLight;
        // this.three.pointLight.castShadow = true;
        this.three.pointLight.position.set(0, -0.8, 88);
        this.three.scene.add(this.three.pointLight);
    }
    initSpotLight(): void {
        // DirectionalLight(色, 光の強さ)
        // 特定の方向に放射される光。光源は無限に離れているものとして、そこから発生する光線はすべて平行になる。
        // ※平行光源
        const spotLight = new SpotLight('#ffffff', 3.0);
        this.three.spotLight = spotLight;
        // this.three.spotLight.castShadow = true;
        this.three.spotLight.intensity = 5.0;
        // const posX = this.isMobile ? 1.5 : 0;
        this.three.spotLight.position.set(0, 2, 88);
        this.three.spotLight.angle = radians(-80);
        const scale = this.isMobile ? 1 : 2;
        // this.three.spotLight.scale.set(scale, scale, scale);
        // this.three.spotLightHelper = new SpotLightHelper(this.three.spotLight);
        // this.three.spotLightHelper.add(this.three.spotLight);
        this.three.scene.add(this.three.spotLight);
    }
    createModels(): void {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/portfolio/draco/');
        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);
        const objSrc = '/portfolio/draco/objs/post_d.glb';
        gltfLoader.load(objSrc, (obj) => {
            const children = [...obj.scene.children];
            for (const child of children) {
                // child.scale.set(1, 1, 1);
                child.castShadow = true;
                child.receiveShadow = true;
                // console.log(child);
                this.three.object.add(child);
            }
            // obj.scene.traverse((model) => {
            //     model.castShadow = true;
            //     model.receiveShadow = true;
            // });
            const scale = this.isMobile ? 1 : 1.02;
            this.isMobile ? obj.scene.scale.set(scale, scale, scale) : obj.scene.scale.set(scale, scale, scale);
            // this.three.object.add(obj.scene);
            this.three.object.position.set(0, -1.5, 82.5);
            // atan2：点 (0, 0) から点 (x, y) までの半直線と、正の x 軸の間の平面上での角度 (ラジアン単位) を返す
            // const angle = Math.atan2(this.three.object.position.y, this.three.object.position.x);
            const angleX = this.isMobile ? radians(8) : radians(10);
            this.three.object.rotation.set(angleX, 0, 0);
            this.render();
            // this.initGui();
        });
    }
    setModels(): void {
        this.three.scene.add(this.three.object);
        this.render();
    }
    removeModels(): void {
        removeClass(this.canvas, hasClass.active);
        setTimeout(() => {
            this.three.scene.clear();
            this.three.renderer.clear();
            this.three.renderer.dispose();
            this.three.renderer.domElement.remove();
        }, 1000);
    }
    render(): void {
        // 画面に描画する
        this.three.renderer.render(this.three.scene, this.three.camera);
        // requestAnimationFrame(this.render.bind(this));
    }
    handleResize(): void {
        this.setSize();
        this.initViewport();
        const width = this.canvas.closest('div').clientWidth;
        const height = this.canvas.closest('div').clientHeight;
        if (this.three.camera) {
            this.three.object.position.set(0, -1.5, 82.5);
            // カメラのアスペクト比を正す
            this.three.camera.aspect = width / height;
            this.three.camera.updateProjectionMatrix();
        }
        if (this.three.renderer) {
            this.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.three.renderer.setSize(width, height);
        }
        // this.three.object.position.set(0, posY, 985);
        this.render();
    }
    handleMove(e: MouseEvent): void {
        this.mouse.x = (e.clientX / this.winSize.width) * 2 - 1;
        this.mouse.y = -(e.clientY / this.winSize.height) * 2 + 1;
        // this.mouse.x = e.clientX - this.winSize.width * 0.5;
        // this.mouse.y = -(e.clientY - this.winSize.height * 0.5);
        // this.raycast();
    }
}
