import * as THREE from 'three';
import gsap, { Power2 } from 'gsap';
import Webgl from './webgl';
import { isMobile } from './isMobile';
import transitionVertexShader from '../glsl/transition/vertexshader.vert';
import transitionFragmentShader from '../glsl/transition/fragmentShader.frag';
import { Vector3 } from 'three';

interface ThreeNumber {
    [key: string]: number;
}

export default class Transition extends Webgl {
    three: {
        camera: THREE.PerspectiveCamera | null;
        scene: THREE.Scene;
        mesh: THREE.Mesh[] | null;
        stars: THREE.Points | null;
        renderer: THREE.WebGLRenderer | null;
        clock: THREE.Clock | null;
    };
    elms: {
        wrapper: HTMLElement;
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
    constructor() {
        super();
        this.three = {
            camera: null,
            scene: new THREE.Scene(),
            mesh: [],
            stars: null,
            renderer: null,
            clock: null,
        };
        this.elms = {
            wrapper: document.querySelector('[data-transition="wrapper"]'),
            canvas: document.querySelector('[data-transition="canvas"]'),
        };
        this.isMobile = isMobile();
        this.param = {
            color: '#eb5834',
            speed: 1.5,
            ratio: this.isMobile ? 0.15 : 0.26,
            direction: 1,
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
        this.three.scene.add(this.three.mesh[0], this.three.mesh[1]);
        this.update();
        this.render();
        this.elms.wrapper.style.backgroundColor = 'transparent';
    }
    initMesh(): THREE.Mesh[] {
        const meshList = [] as THREE.Mesh[];
        for (let i = 0; i < 2; i++) {
            const mesh = this.createMesh();
            meshList.push(mesh);
        }

        return meshList;
    }
    createMesh(): THREE.Mesh {
        const uniforms = {
            uColor: {
                value: new THREE.Color(this.param.color),
            },
            uDirection: {
                value: this.param.direction,
            },
            uScale: {
                value: new THREE.Vector2(1, 1),
            },
            uPosition: {
                value: new THREE.Vector2(0, 0),
            },
            uProgress: {
                value: 1.0,
            },
            uRatio: {
                value: this.param.ratio,
            },
            uCurl: {
                value: 0.0,
            },
            uThreshold: {
                value: true,
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
            uniforms: uniforms,
            vertexShader: transitionVertexShader,
            fragmentShader: transitionFragmentShader,
            side: THREE.DoubleSide,
            transparent: true,
            // 拡張機能
            // extensions: {
            //     derivatives: true,
            // },
        });
        const mesh = new THREE.Mesh(geometry, material);
        // 視錐台カリングを有効にするかどうか
        // ↑カメラから見えているかどうかを判断する。カメラから外れていたら、描画対象（DrawMesh）から外す
        mesh.frustumCulled = false;
        return mesh;
    }
    update(): void {
        const rect = this.elms.canvas.getBoundingClientRect();
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

        for (const [index, mesh] of Object.entries(this.three.mesh)) {
            const i = parseInt(index) + 1;
            // 上記、新しい値を使用し、メッシュを拡大縮小して配置する
            mesh.scale.x = widthViewUnit;
            mesh.scale.y = heightViewUnit;
            mesh.position.x = x;
            mesh.position.y = y;
            mesh.position.z = i;
            // Shaderパラメータ更新
            const material = <THREE.ShaderMaterial>mesh.material;
            material.uniforms.uScale.value.x = widthViewUnit;
            material.uniforms.uScale.value.y = heightViewUnit;
            material.uniforms.uPosition.value.x = x / widthViewUnit;
            material.uniforms.uPosition.value.y = y / heightViewUnit;

            if (i > 1) {
                const color = new THREE.Color('#51a2f6');
                material.uniforms.uColor.value = new Vector3(color.r, color.g, color.b);
            }
        }
    }
    render(): void {
        // 画面に描画する
        this.three.renderer.render(this.three.scene, this.three.camera);
    }
    async start(): Promise<void> {
        const tl = gsap.timeline({
            paused: true,
            defaults: {
                duration: this.param.speed,
                ease: Power2.easeInOut,
            },
        });
        const material = <THREE.ShaderMaterial>this.three.mesh[1].material;
        tl.set(material.uniforms.uThreshold, {
            value: false,
        });
        tl.to(
            material.uniforms.uProgress,
            {
                value: 0.0,
                onUpdate: () => {
                    this.render();
                },
            },
            0.2
        );
        tl.to(
            this.calc(material),
            {
                progress: 1.0,
                onStart: () => {
                    this.last();
                },
            },
            0.2
        );
        tl.set(material.uniforms.uThreshold, {
            value: true,
        });
        tl.play();
    }
    last(): void {
        const material = <THREE.ShaderMaterial>this.three.mesh[0].material;
        const tl = gsap.timeline({
            paused: true,
            defaults: {
                duration: this.param.speed,
                ease: Power2.easeInOut,
            },
        });
        tl.set(material.uniforms.uThreshold, {
            value: false,
        });
        tl.to(
            material.uniforms.uProgress,
            {
                value: 0.0,
                onUpdate: () => {
                    this.render();
                },
            },
            0.2
        );
        tl.to(
            this.calc(material),
            {
                progress: 1.0,
                onComplete: () => {
                    this.elms.wrapper.style.display = 'none';
                },
            },
            0.2
        );
        tl.set(material.uniforms.uThreshold, {
            value: true,
        });
        tl.play();
    }
    calc(material: THREE.ShaderMaterial): gsap.core.Timeline {
        const tl = gsap.timeline({
            paused: true,
            defaults: {
                ease: 'linear',
                duration: 0.6,
            },
        });
        tl.to(material.uniforms.uCurl, {
            value: 0.3,
        });
        tl.to(material.uniforms.uCurl, {
            value: 0.0,
        });
        return tl;
    }
}
