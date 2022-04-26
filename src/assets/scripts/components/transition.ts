import * as THREE from 'three';
import gsap, { Power2 } from 'gsap';
import Webgl from './webgl';
import { isMobile } from './isMobile';
import transitionVertexShader from '../glsl/transition/vertexshader.vert';
import transitionFragmentShader from '../glsl/transition/fragmentShader.frag';

interface ThreeNumber {
    [key: string]: number;
}

interface UniformOptions {
    [uniform: string]: THREE.IUniform;
}

export default class Transition extends Webgl {
    three: {
        camera: THREE.PerspectiveCamera | null;
        scene: THREE.Scene;
        mesh: THREE.Mesh | null;
        renderer: THREE.WebGLRenderer | null;
    };
    elms: {
        item: HTMLElement;
        canvas: HTMLCanvasElement;
    };
    isMobile: boolean;
    param: {
        color: string;
        speed: number;
        ratio: number;
        direction: number;
    };
    viewport!: ThreeNumber;
    state: string;
    flg: {
        isAnimating: boolean;
    };
    uniforms: UniformOptions;
    constructor() {
        super();
        this.three = {
            camera: null,
            scene: new THREE.Scene(),
            mesh: null,
            renderer: null,
        };
        this.elms = {
            item: document.querySelector('[data-transition="item"]'),
            canvas: document.querySelector('[data-transition="canvas"]'),
        };
        this.isMobile = isMobile();
        this.param = {
            color: '#ebab40',
            speed: 1.35,
            ratio: this.isMobile ? 0.15 : 0.26,
            direction: 1,
        };
        this.state = 'grid';
        this.flg = {
            isAnimating: false,
        };
    }
    init(): void {
        this.setSize();
        // カメラを作成
        this.three.camera = this.initCamera();
        // カメラをシーンに追加
        this.three.scene.add(this.three.camera);
        // レンダラーを作成
        this.three.renderer = this.initRenderer();
        // HTMLに追加
        this.elms.canvas.appendChild(this.three.renderer.domElement);
        // ビューポート計算
        this.viewport = this.initViewport();
        // メッシュを作成
        this.three.mesh = this.initMesh();
        // メッシュをシーンに追加
        this.three.scene.add(this.three.mesh);
        // メッシュを更新
        this.update();
    }
    initMesh(): THREE.Mesh {
        this.uniforms = {
            uColor: {
                value: new THREE.Color(this.param.color),
            },
            uScale: {
                value: new THREE.Vector2(1, 1),
            },
            uPosition: {
                value: new THREE.Vector2(0, 0),
            },
            uProgress: {
                value: 0.0,
            },
            // 解像度
            uResolution: {
                value: new THREE.Vector2(this.viewport.width, this.viewport.height),
            },
        };
        // 分割数
        const segments = 128;
        // 形状データを作成
        const geometry = new THREE.PlaneBufferGeometry(1, 1, segments, segments);
        // 質感を作成
        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: transitionVertexShader,
            fragmentShader: transitionFragmentShader,
            // 両面を描画
            side: THREE.DoubleSide,
            // 拡張機能
            // extensions: {
            //     derivatives: true,
            // },
        });
        const mesh = new THREE.Mesh(geometry, material);
        // mesh.frustumCulled = false;
        return mesh;
    }
    update(): void {
        const rect = this.elms.item.getBoundingClientRect();
        const winSizeW = this.winSize.width;
        const winSizeH = this.winSize.height;
        const viewportW = this.viewport.width;
        const viewportH = this.viewport.height;

        // ピクセル単位をカメラの視野単位にマッピングする
        const widthViewUnit = (rect.width * viewportW) / winSizeW;
        const heightViewUnit = (rect.height * viewportH) / winSizeH;
        let xViewUnit = (rect.left * viewportW) / winSizeW;
        let yViewUnit = (rect.top * viewportH) / winSizeH;

        // 単位の基準を左上ではなく中央にする
        xViewUnit = xViewUnit - viewportW / 2;
        yViewUnit = yViewUnit - viewportH / 2;

        // 位置の原点は左上ではなく平面の中心にする
        let x = xViewUnit + widthViewUnit / 2;
        let y = -yViewUnit - heightViewUnit / 2;
        // 上記、新しい値を使用し、メッシュを拡大縮小して配置する
        const mesh = this.three.mesh;
        mesh.scale.x = widthViewUnit;
        mesh.scale.y = heightViewUnit;
        mesh.position.x = x;
        mesh.position.y = y;
        // Shaderパラメータ更新
        const material = <THREE.ShaderMaterial>mesh.material;
        material.uniforms.uScale.value.x = widthViewUnit;
        material.uniforms.uScale.value.y = heightViewUnit;
        material.uniforms.uPosition.value.x = x / widthViewUnit;
        material.uniforms.uPosition.value.y = y / heightViewUnit;
    }
    render(): void {
        // 画面に描画する
        this.three.renderer.render(this.three.scene, this.three.camera);
    }
    async start(): Promise<void> {
        this.displayInFull();
    }
    displayInFull(): void {
        if (this.state === 'full' || this.flg.isAnimating) return;
        this.flg.isAnimating = true;
        this.elms.canvas.style.zIndex = '2';
        const tl = gsap.timeline({
            paused: true,
            defaults: {
                duration: 1.5,
                ease: Power2.easeInOut,
            },
        });
        const material = <THREE.ShaderMaterial>this.three.mesh.material;
        tl.to(
            material.uniforms.uProgress,
            {
                value: 1,
                onUpdate: () => this.render(),
                onComplete: () => {
                    this.flg.isAnimating = false;
                    this.state = 'full';
                },
            },
            0
        );
        tl.play();
    }
}
