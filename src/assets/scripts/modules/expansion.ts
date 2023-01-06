import { Color, DoubleSide, Mesh, PlaneBufferGeometry, ShaderMaterial, Vector2 } from 'three';
import gsap, { Power2 } from 'gsap';
import expansionVertexShader from '../glsl/expansion/vertexshader.vert';
import expansionFragmentShader from '../glsl/expansion/fragmentShader.frag';
import { addClass, removeClass } from '../utils/classList';
import { hasClass } from '../utils/hasClass';
import Webgl from '~/assets/scripts/modules/webgl';
import { isMobile } from '~/assets/scripts/modules/isMobile';

interface UniformOptions {
    [uniform: string]: THREE.IUniform;
}

export default class Expansion extends Webgl {
    elms: {
        item: HTMLElement;
        canvas: HTMLCanvasElement;
        expansion: HTMLElement;
        wrapper: HTMLElement;
        title: HTMLCanvasElement;
        post: HTMLElement;
        contact: HTMLCanvasElement;
        contactWrap: HTMLElement;
        study: HTMLCanvasElement;
        // envelope: HTMLElement;
        envelopeOpener: HTMLElement;
        envelopeLetter: HTMLElement;
    };
    isMobile: boolean;
    param: {
        color1: string;
        color2: string;
        color3: string;
        speed: number;
        ratio: number;
        direction: number;
    };
    state: string;
    flg: {
        isOpen: boolean;
        isAnimating: boolean;
    };
    uniforms: UniformOptions;
    constructor() {
        super();
        this.elms = {
            item: document.querySelector('[data-expansion="item"]'),
            canvas: document.querySelector('[data-expansion="canvas"]'),
            expansion: document.querySelector('[data-expansion="expansion"]'),
            wrapper: document.querySelector('[data-expansion="wrapper"]'),
            title: document.querySelector('[data-canvas="title"]'),
            post: document.querySelector('[data-post]'),
            contact: document.querySelector('[data-canvas="contact"]'),
            contactWrap: document.querySelector('.p-index-contact'),
            study: document.querySelector('.p-index-study'),
            // envelope: document.querySelector('[data-envelope]'),
            envelopeOpener: document.querySelector('[data-envelope-opener]'),
            envelopeLetter: document.querySelector('[data-envelope-letter]'),
        };
        this.isMobile = isMobile();
        this.param = {
            color1: '#ffffff', // '#70d872', //#f8f3ba',
            color2: '#f9f5ce', // #f8f3ba',
            color3: '#b0d3ee', // #f8f3ba',
            speed: 1.35,
            ratio: this.isMobile ? 0.15 : 0.26,
            direction: 1,
        };
        this.state = 'grid';
        this.flg = {
            isOpen: false,
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
        // 手紙のホバー
        this.enter();
        this.leave();
    }
    initMesh(): THREE.Mesh {
        const color1 = new Color(this.param.color1);
        this.uniforms = {
            uColor1: {
                value: new Color('#70d872'),
            },
            uColor2: {
                value: new Color(this.param.color1),
            },
            uColor1R: {
                value: color1.r,
            },
            uColor1G: {
                value: color1.g,
            },
            uColor1B: {
                value: color1.b,
            },
            uColor2R: {
                value: color1.r,
            },
            uColor2G: {
                value: color1.g,
            },
            uColor2B: {
                value: color1.b,
            },
            uScale: {
                value: new Vector2(1, 1),
            },
            uPosition: {
                value: new Vector2(0, 0),
            },
            uProgress: {
                value: 0.0,
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
            uniforms: this.uniforms,
            vertexShader: expansionVertexShader,
            fragmentShader: expansionFragmentShader,
            // 両面を描画
            side: DoubleSide,
            // 拡張機能
            // extensions: {
            //     derivatives: true,
            // },
        });
        const mesh = new Mesh(geometry, material);
        // mesh.frustumCulled = false;
        return mesh;
    }
    update(): void {
        const rect = document.querySelector('[data-expansion="item"]').getBoundingClientRect();
        const winSizeW = window.innerWidth;
        const winSizeH = window.innerHeight;
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
        const x = xViewUnit + widthViewUnit / 2;
        const y = -yViewUnit - heightViewUnit / 2;

        // 上記、新しい値を使用し、メッシュを拡大縮小して配置する
        const mesh = this.three.mesh as Mesh;
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
        material.uniforms.uResolution.value = new Vector2(this.viewport.width, this.viewport.height);
        material.needsUpdate = true;
    }
    render(): void {
        // 画面に描画する
        this.three.renderer.render(this.three.scene, this.three.camera);
    }
    resetUniforms() {
        this.uniforms.uScale.value = new Vector2(1, 1);
        this.uniforms.uPosition.value = new Vector2(0, 0);
        this.uniforms.uResolution.value = new Vector2(1, 1);
    }
    async start(): Promise<void> {
        await this.openLetter();
        this.update();
        await this.displayInFull();
    }
    // eslint-disable-next-line require-await
    async openLetter(): Promise<void> {
        return new Promise((resolve) => {
            const tl = gsap.timeline({
                paused: true,
                defaults: {
                    duration: 0.5,
                    ease: Power2.easeInOut,
                },
            });
            tl.to(
                this.elms.envelopeOpener,
                {
                    rotateX: '0deg',
                    onStart: () => (this.flg.isOpen = true),
                    onComplete: () => (this.elms.envelopeOpener.style.zIndex = '2'),
                },
                0
            ).to(
                this.elms.envelopeLetter,
                {
                    top: this.isMobile ? '-200%' : '-200%',
                    onComplete: () => {
                        resolve();
                    },
                },
                0.5
            );
            tl.play();
        });
    }
    // eslint-disable-next-line require-await
    async closeLetter(): Promise<void> {
        return new Promise((resolve) => {
            const tl = gsap.timeline({
                paused: true,
                defaults: {
                    duration: 0.5,
                    ease: Power2.easeInOut,
                },
            });
            tl.to(this.elms.envelopeLetter, {
                top: '0',
                onComplete: () => (this.elms.envelopeOpener.style.zIndex = '5'),
            }).to(
                this.elms.envelopeOpener,
                {
                    rotateX: '180deg',
                    onComplete: () => {
                        this.flg.isOpen = false;
                        resolve();
                    },
                },
                0.5
            );
            tl.play();
        });
    }
    displayInFull(): Promise<void> {
        // addClass(this.elms.envelope, hasClass.active)
        return new Promise((resolve) => {
            if (this.state === 'full' || this.flg.isAnimating) return;
            this.flg.isAnimating = true;
            const tl = gsap.timeline({
                paused: true,
                defaults: {
                    ease: Power2.easeOut,
                },
            });
            const material = this.getMaterial(<Mesh>this.three.mesh);
            this.elms.contact.setAttribute('data-title', 'contact');
            tl.set(this.elms.canvas, {
                zIndex: 1004,
            });
            tl.to(
                material.uniforms.uProgress,
                {
                    duration: 1,
                    value: 1,
                    onUpdate: () => {
                        // console.log(console.log("start");)
                        this.render();
                    },
                    onStart: () => {
                        removeClass(document.body, hasClass.active);
                        // addClass(this.elms.expansion, hasClass.active);
                        // addClass(this.elms.post, hasClass.active);
                        addClass(this.elms.canvas, hasClass.active);
                        this.displayContent();
                        // setTimeout(() => {
                        //     resolve();
                        // }, 600);
                    },
                    onComplete: () => {
                        // this.changeColor(tl, this.param.color2, this.param.color3);
                        // this.elms.study.style.visibility = 'hidden';
                        // this.elms.study.style.display = 'none';
                        this.flg.isAnimating = false;
                        this.state = 'full';
                        resolve();
                    },
                },
                0
            );
            this.changeColor(tl, this.param.color2, this.param.color3);
            tl.play();
        });
    }
    displayContent(): void {
        const tl = gsap.timeline({
            paused: true,
            defaults: {
                duration: 0.5,
                ease: Power2.easeInOut,
            },
        });
        tl.set(this.elms.contactWrap, { visibility: 'visible' });
        tl.to(
            this.elms.contactWrap,
            {
                opacity: 1,
                onComplete: () => {
                    addClass(this.elms.contactWrap, hasClass.active);
                },
            },
            0
        );
        tl.to(
            '[data-title="contact"]',
            {
                opacity: 1,
            },
            0
        );
        tl.play();
    }
    close(): void {
        if (this.state === 'close' || this.flg.isAnimating) return;
        this.flg.isAnimating = true;
        const tl = gsap.timeline({
            paused: true,
            defaults: {
                duration: 1.5,
                ease: Power2.easeInOut,
            },
        });
        const material = this.getMaterial(<Mesh>this.three.mesh);
        this.hiddenContent();
        tl.to(
            material.uniforms.uProgress,
            {
                value: 0,
                onUpdate: () => {
                    this.render();
                },
                onStart: () => {
                    removeClass(this.elms.contactWrap, hasClass.active);
                    this.elms.study.style.visibility = 'visible';
                    // this.elms.study.style.display = 'block';
                },
                onComplete: async () => {
                    this.flg.isAnimating = false;
                    this.state = 'close';
                    this.elms.canvas.style.zIndex = '-1';
                    await this.closeLetter();
                    // this.displayContent();
                },
            },
            0
        );
        this.changeColor(tl, this.param.color1, this.param.color1);
        tl.play();
    }
    hiddenContent(): void {
        const tl = gsap.timeline({
            paused: true,
            defaults: {
                duration: 1,
                ease: Power2.easeInOut,
            },
        });
        tl.to(
            this.elms.contactWrap,
            {
                opacity: 0,
                onComplete: () => {
                    this.elms.contactWrap.style.visibility = 'hidden';
                    addClass(document.body, hasClass.active);
                    removeClass(this.elms.expansion, hasClass.active);
                    // removeClass(this.elms.post, hasClass.active);
                    removeClass(this.elms.canvas, hasClass.active);
                },
            },
            0
        );
        tl.to(
            '[data-title="contact"]',
            {
                opacity: 0,
            },
            0
        );
        tl.play();
    }
    changeColor(tl: gsap.core.Timeline, color1: string, color2: string): void {
        const material = this.getMaterial(<Mesh>this.three.mesh);
        const changeColor1 = new Color(color1);
        const changeColor2 = new Color(color2);
        tl.to(
            material.uniforms.uColor1R,
            {
                value: changeColor1.r,
            },
            '<'
        );
        tl.to(
            material.uniforms.uColor1G,
            {
                value: changeColor1.g,
                // onUpdate: () => this.render(),
            },
            '<'
        );
        tl.to(
            material.uniforms.uColor1B,
            {
                value: changeColor1.b,
            },
            '<'
        );
        tl.to(
            material.uniforms.uColor2R,
            {
                value: changeColor2.r,
            },
            '<'
        );
        tl.to(
            material.uniforms.uColor2G,
            {
                value: changeColor2.g,
            },
            '<'
        );
        tl.to(
            material.uniforms.uColor2B,
            {
                value: changeColor2.b,
            },
            '<'
        );
        // tl.play();
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
    enter(): void {
        this.elms.wrapper.addEventListener('mouseenter', () => {
            if (!this.flg.isOpen) {
                gsap.to(this.elms.envelopeOpener, {
                    duration: 0.3,
                    delay: 0,
                    ease: Power2.easeOut,
                    rotateX: '130deg',
                });
            }
        });
    }
    leave(): void {
        this.elms.wrapper.addEventListener('mouseleave', () => {
            if (!this.flg.isOpen) {
                gsap.to(this.elms.envelopeOpener, {
                    duration: 0.3,
                    delay: 0,
                    ease: Power2.easeOut,
                    rotateX: '180deg',
                });
            }
        });
    }
    dispose(): void {
        this.three.scene.clear();
        this.three.renderer.clear();
        this.three.renderer.dispose();
        this.three.renderer.domElement.remove();
        this.three.renderer = null;
    }
}
