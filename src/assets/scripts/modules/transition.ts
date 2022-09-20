import { PlaneBufferGeometry, Mesh, Vector3, ShaderMaterial, DoubleSide, Color, Vector2 } from 'three';
import gsap, { Power2 } from 'gsap';
import Webgl from './webgl';
import { isMobile } from '~/assets/scripts/modules/isMobile';
import transitionVertexShader from '~/assets/scripts/glsl/transition/vertexshader.vert';
import transitionFragmentShader from '~/assets/scripts/glsl/transition/fragmentShader.frag';

export default class Transition extends Webgl {
    elms: {
        wrapper: HTMLElement | null;
        canvas: HTMLCanvasElement | null;
    };
    isMobile: boolean;
    param: {
        color: string;
        speed: number;
        ratio: number;
        direction: number;
    };
    constructor() {
        super();
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
        if (this.elms.canvas) this.elms.canvas.appendChild(this.three.renderer.domElement);
        // ビューポート計算
        this.viewport = this.initViewport();
        // メッシュを作成
        this.three.mesh = this.initMesh();
        // メッシュをシーンに追加
        this.three.scene.add(this.three.mesh[0], this.three.mesh[1]);
        this.update();
        this.render();
        if (this.elms.wrapper) this.elms.wrapper.style.backgroundColor = 'transparent';
    }
    initMesh(): Mesh[] {
        const meshList = [] as Mesh[];
        for (let i = 0; i < 2; i++) {
            const mesh = this.createMesh();
            meshList.push(mesh);
        }

        return meshList;
    }
    createMesh(): Mesh {
        const uniforms = {
            uColor: {
                value: new Color(this.param.color),
            },
            uDirection: {
                value: this.param.direction,
            },
            uScale: {
                value: new Vector2(1, 1),
            },
            uPosition: {
                value: new Vector2(0, 0),
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
                value: new Vector2(this.viewport.width, this.viewport.height),
            },
        };
        // 分割数
        const segments = 128;
        // 形状データを作成
        const geometry = new PlaneBufferGeometry(1, 1, segments, segments);
        // 質感を作成
        const material = new ShaderMaterial({
            uniforms: uniforms,
            vertexShader: transitionVertexShader,
            fragmentShader: transitionFragmentShader,
            side: DoubleSide,
            transparent: true,
            // 拡張機能
            // extensions: {
            //     derivatives: true,
            // },
        });
        const mesh = new Mesh(geometry, material);
        // 視錐台カリングを有効にするかどうか
        // ↑カメラから見えているかどうかを判断する。カメラから外れていたら、描画対象（DrawMesh）から外す
        mesh.frustumCulled = false;
        return mesh;
    }
    update(): void {
        // if (this.elms.canvas) {
        this.setSize();
        this.initViewport();
        const rect = this.elms.canvas.getBoundingClientRect();
        const winSizeW = window.innerWidth;
        const winSizeH = window.innerWidth;
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

        if (this.three.mesh) {
            for (const [index, mesh] of Object.entries(this.three.mesh)) {
                const i = parseInt(index) + 1;
                // 上記、新しい値を使用し、メッシュを拡大縮小して配置する
                mesh.scale.x = widthViewUnit;
                mesh.scale.y = heightViewUnit;
                mesh.position.x = x;
                mesh.position.y = y;
                mesh.position.z = i;
                // Shaderパラメータ更新
                const material = <ShaderMaterial>mesh.material;
                material.uniforms.uScale.value.x = widthViewUnit;
                material.uniforms.uScale.value.y = heightViewUnit;
                material.uniforms.uPosition.value.x = x / widthViewUnit;
                material.uniforms.uPosition.value.y = y / heightViewUnit;

                if (i > 1) {
                    const color = new Color('#51a2f6');
                    material.uniforms.uColor.value = new Vector3(color.r, color.g, color.b);
                }
            }
        }
        // }
    }
    render(): void {
        // 画面に描画する
        if (this.three.renderer && this.three.camera) this.three.renderer.render(this.three.scene, this.three.camera);
    }
    async start(): Promise<void> {
        const meshList = this.three.mesh as Mesh[];
        if (meshList.length) {
            const material1 = this.getMaterial(meshList[0]);
            const material2 = this.getMaterial(meshList[1]);

            const tl = gsap.timeline({
                paused: true,
                defaults: {
                    duration: this.param.speed,
                    ease: Power2.easeInOut,
                },
            });
            tl.set(material2.uniforms.uThreshold, {
                value: false,
            });
            tl.to(
                material2.uniforms.uProgress,
                {
                    value: 0.0,
                    onUpdate: () => {
                        this.render();
                    },
                },
                0.2
            );
            tl.to(
                this.calc(material2),
                {
                    progress: 1.0,
                    onStart: () => {
                        this.last(material1);
                    },
                },
                0.2
            );
            tl.set(material2.uniforms.uThreshold, {
                value: true,
            });
            tl.play();
        }
    }
    last(material: ShaderMaterial): void {
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
                    if (this.elms.wrapper) this.elms.wrapper.style.display = 'none';
                },
            },
            0.2
        );
        tl.set(material.uniforms.uThreshold, {
            value: true,
        });
        tl.play();
    }
    calc(material: ShaderMaterial): gsap.core.Timeline {
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
    getMaterial(mesh: Mesh): ShaderMaterial {
        return <ShaderMaterial>mesh.material;
    }
    dispose(): void {
        this.three.scene.clear();
        this.three.renderer.clear();
        this.three.renderer.dispose();
        this.three.renderer.domElement.remove();
        this.three.renderer = null;
    }
    handleResize(): void {
        this.setSize();
        this.initViewport();
        if (this.three.renderer) {
            this.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.three.renderer.setSize(this.winSize.width, this.winSize.height);
        }
        if (this.three.camera) {
            // カメラのアスペクト比を正す
            this.three.camera.aspect = this.winSize.width / this.winSize.height;
            this.three.camera.updateProjectionMatrix();
        }
        this.update();
        this.render();
    }
}
