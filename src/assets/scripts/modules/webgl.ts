import {
    PerspectiveCamera,
    Scene,
    Mesh,
    WebGLRenderer,
    PointLight,
    Object3D,
    sRGBEncoding,
    ACESFilmicToneMapping,
    BufferGeometry,
    Points,
    Clock,
    DirectionalLight,
    DirectionalLightHelper,
    SpotLight,
    SpotLightHelper,
    ShaderMaterial,
    Vector3,
    Texture,
    WebGLRendererParameters,
} from 'three';

interface ThreeNumber {
    [key: string]: number;
}

interface CameraOption {
    width: number;
    height: number;
    near: number;
    far: number;
    position: Partial<Vector3>;
}

const defaultsCamera: CameraOption = {
    width: window.innerWidth,
    height: window.innerHeight,
    near: 0.1,
    far: 3000,
    position: { x: 0, y: 0, z: 1000 },
};

interface RendererOption {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
}

const defaultsRenderer: RendererOption = {
    canvas: null,
    width: window.innerWidth,
    height: window.innerHeight,
};

export default class Webgl {
    three: {
        camera: PerspectiveCamera | null;
        scene: Scene;
        geometry: BufferGeometry | null;
        mesh: Mesh | Mesh[] | null;
        bgMesh?: Mesh[];
        textureList?: Texture[];
        floor?: THREE.Mesh | null;
        points?: Points | null;
        object: Object3D | null;
        renderer: WebGLRenderer | null;
        clock: Clock | null;
        pointLight?: PointLight | null;
        ambientLight?: THREE.AmbientLight | null;
        directionalLight?: DirectionalLight | null;
        directionalLightHelper?: DirectionalLightHelper | null;
        spotLight?: SpotLight | null;
        spotLightHelper?: SpotLightHelper | null;
    };
    winSize: ThreeNumber;
    viewport!: ThreeNumber;
    constructor() {
        this.three = {
            camera: null,
            scene: new Scene(),
            geometry: null,
            mesh: null,
            bgMesh: null,
            textureList: [],
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
        this.winSize = {
            width: 0,
            height: 0,
        };
        this.viewport = {
            width: 0,
            height: 0,
        };
    }
    initCamera(props: Partial<CameraOption> = {}): PerspectiveCamera {
        const params = { ...defaultsCamera, ...props };
        if (this.three.camera) return;
        const camera = new PerspectiveCamera(
            45, // 画角
            params.width / params.height, // 縦横比
            params.near, // 視点から最も近い面までの距離
            params.far // 視点から最も遠い面までの距離
        );
        camera.position.set(params.position.x, params.position.y, params.position.z);
        // どの位置からでも指定した座標に強制的に向かせることができる命令
        // camera.lookAt(this.three.scene.position);
        camera.updateProjectionMatrix();
        return camera;
    }
    initRenderer(props: Partial<RendererOption> = {}): WebGLRenderer {
        const params = { ...defaultsRenderer, ...props };
        const webglParams: WebGLRendererParameters = {
            alpha: true,
            antialias: true, // 物体の輪郭を滑らかにする
        };
        if (params.canvas) webglParams['canvas'] = params.canvas;
        const renderer = new WebGLRenderer(webglParams);
        /**
         * デスクトップでは、メインディスプレイ・サブディスプレイでPixelRatioの異なる可能性がある。
         * ➡ リサイズイベントでsetPixelRatioメソッドでを使って更新
         * https://ics.media/tutorial-three/renderer_resize/
         */
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0xeaf2f5, 0);
        renderer.setSize(params.width, params.height);
        renderer.physicallyCorrectLights = true;
        renderer.outputEncoding = sRGBEncoding; // 出力エンコーディングを指定
        renderer.toneMapping = ACESFilmicToneMapping;
        return renderer;
    }
    initViewport(): ThreeNumber {
        if (this.three.camera) {
            // fov : Field OF View (カメラの位置から見えるシーンの範囲)
            // 角度をラジアンに変更
            const fov = this.three.camera.fov * (Math.PI / 180);
            // https://kou.benesse.co.jp/nigate/math/a14m0313.html
            // https://qiita.com/watabo_shi/items/0811d03390c18e46be86
            // tanΘ(高さの半分 / 奥行) * 奥行 * 2
            const height = Math.abs(Math.tan(fov / 2) * this.three.camera.position.z * 2);
            const width = height * this.three.camera.aspect;
            this.viewport = {
                width,
                height,
            };
        }
        return this.viewport;
    }
    setSize(): void {
        this.winSize = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }
    getMaterial(mesh: Mesh): ShaderMaterial {
        return <ShaderMaterial>mesh.material;
    }
}
