import {
    Mesh,
    ShaderMaterial,
    Color,
    Vector2,
    IUniform,
    Texture,
    TextureLoader,
    PlaneBufferGeometry,
    Vector3,
} from 'three';
import gsap from 'gsap';
import photoVertexShader from '~/assets/scripts/glsl/photo/vertexshader.vert';
import photoFragmentShader from '~/assets/scripts/glsl/photo/fragmentShader.frag';
import photoBgVertexShader from '~/assets/scripts/glsl/photo/bg/vertexshader.vert';
import photoBgFragmentShader from '~/assets/scripts/glsl/photo/bg/fragmentShader.frag';
import { lerp } from '~/assets/scripts/utils/math';
import Webgl from '~/assets/scripts/modules/webgl';
import { isMobile } from '~/assets/scripts/modules/isMobile';

interface ThreeNumber {
    [key: string]: number;
}

interface ScrollOptions {
    current: number;
    previous: number;
    ease: number;
}

interface UniformOptions {
    [uniform: string]: IUniform;
}

export default class Photo extends Webgl {
    elms: {
        canvas: HTMLCanvasElement;
        link: NodeListOf<HTMLImageElement>;
        images: NodeListOf<HTMLImageElement>;
        mv: HTMLCanvasElement;
        expansion: HTMLCanvasElement;
        horizontalList: HTMLElement;
    };
    mouse: {
        x: number;
        y: number;
    };
    time: ThreeNumber;
    rectList: DOMRect[];
    flg: {
        [key: string]: boolean;
    };
    scrollList: ScrollOptions[];
    meshList: Mesh[];
    bgMeshList: Mesh[][];
    srcList: string[];
    studyData: {
        url: string;
        title: string;
    };
    imagePath: string;
    targetY: number;
    animFrame?: number;
    isLast: boolean;
    isMobile: boolean;
    constructor() {
        super();
        this.rectList = [];
        this.elms = {
            canvas: document.querySelector('[data-study="canvas"]'),
            link: document.querySelectorAll('[data-study="link"]'),
            images: document.querySelectorAll('[data-study="image"]'),
            mv: document.querySelector('.p-index-mv'),
            expansion: document.querySelector('[data-expansion="canvas"]'),
            horizontalList: document.querySelector('[data-horizontal="list"]'),
        };
        this.winSize = {
            width: 0,
            height: 0,
        };
        this.time = {
            total: 0,
            delta: 0,
        };
        this.mouse = {
            x: 0,
            y: 0,
        };
        this.flg = {
            isScroll: false,
            isMove: false,
            display: false,
            isContact: false,
        };
        this.scrollList = [];
        this.meshList = [];
        this.bgMeshList = [];
        this.srcList = [];

        this.studyData = {
            url: '',
            title: '',
        };
        this.targetY = 0;
        this.isLast = false;
        this.isMobile = isMobile();
        this.init();
    }
    init(): void {
        for (const el of Object.values(this.elms)) {
            if (!el) return;
        }
        this.setSize();
        // カメラを作成
        this.three.camera = this.initCamera();
        // this.elms.canvas.width = this.elms.canvas.clientWidth;
        // this.elms.canvas.height = this.elms.canvas.clientHeight;

        // this.three.camera = this.initCamera();
        // カメラをシーンに追加
        this.three.scene.add(this.three.camera);
        // レンダラーを作成
        this.three.renderer = this.initRenderer();
        // HTMLに追加
        this.elms.canvas.appendChild(this.three.renderer.domElement);
        // ビューポート計算
        this.viewport = this.initViewport();
        // 画像を読み込むs
        this.load();
        // SPかどうか
        this.setIsMobile();
        // 描写する
        this.render();
        // ハンドリング
        // this.handleEvent();
    }
    async load(): Promise<void> {
        for (const [index, image] of Object.entries(this.elms.images)) {
            const imageName = image.getAttribute('data-study-image').trim();
            if (imageName) await this.texture(index, imageName);
        }
    }
    // eslint-disable-next-line require-await
    async texture(index: string, imageName: string): Promise<Texture> {
        return new Promise((resolve) => {
            const imageSrc = `/textures/${imageName}`;
            const textureLoader = new TextureLoader();
            textureLoader.load(imageSrc, async (texture) => {
                this.three.textureList.push(texture);
                await this.set(parseInt(index));
                resolve(texture);
            });
        });
    }
    // eslint-disable-next-line require-await
    async set(index: number): Promise<void> {
        // メッシュを作成(画像)
        this.three.mesh = this.initMesh(index);
        this.meshList.push(this.three.mesh);
        // メッシュを作成(画像背景用図形)
        this.three.bgMesh = this.initBgMesh();
        this.bgMeshList.push(this.three.bgMesh);
        // メッシュをシーンに追加
        this.three.scene.add(this.three.mesh, this.three.bgMesh[0], this.three.bgMesh[1]);
        // リンクを取得
        this.three.mesh.userData.url = this.getLink(index);
        this.three.mesh.userData.title = this.getTitle(index);
        // HTML要素の情報を取得、3Dモデルの更新
        this.update(index);
        this.scrollList[index].previous = this.meshList[index].position.x;
    }
    initMesh(index: number): Mesh {
        const uniforms = {
            uResolution: {
                value: new Vector2(0.0, 0.0), // 画面サイズ
            },
            uImageResolution: {
                value: new Vector2(400, 300), // 画像サイズ
            },
            uTexture: {
                value: this.three.textureList[index], // 読み込んだ画像
            },
            uProgress: {
                value: 1.0,
            },
            uSpeed: {
                value: 1.0,
            },
            uWave: {
                value: 5.0,
            },
            uTime: {
                value: 0.0,
            },
            uMoz: {
                value: 0.02,
            },
            uIsMobile: {
                value: !!this.isMobile,
            },
        };
        // 分割数
        const segments = 30;
        // 形状データを作成
        const geometry = new PlaneBufferGeometry(1, 1, segments, segments);
        // 質感を作成
        const material = new ShaderMaterial({
            uniforms,
            vertexShader: photoVertexShader,
            fragmentShader: photoFragmentShader,
            transparent: false,
        });
        const mesh = new Mesh(geometry, material);
        return mesh;
    }
    // 遷移先リンクを取得
    getLink(index: number): string {
        return this.elms.images[index].getAttribute('data-study-link');
    }
    // 遷移先タイトルを取得
    getTitle(index: number): string {
        if (!this.elms.link[index]) return;
        return this.elms.link[index].getAttribute('data-study-title');
    }
    initBgMesh(): Mesh[] {
        const bgMeshList = [] as Mesh[];
        for (let i = 0; i < 2; i++) {
            const bgMesh = this.createBgMesh();
            bgMeshList.push(bgMesh);
        }
        return bgMeshList;
    }
    createBgMesh(): Mesh {
        const uniforms: UniformOptions = {
            uResolution: {
                value: new Vector2(0.0, 0.0), // 画面サイズ
            },
            uImageResolution: {
                value: new Vector2(400, 300), // 画像サイズ
            },
            uProgress: {
                value: 1.0,
            },
            uSpeed: {
                value: 1.0,
            },
            uWave: {
                value: 5.0,
            },
            uTime: {
                value: 0.0,
            },
            uColor: {
                value: new Vector3(1.0, 0.1, 1.0),
            },
            uIsMobile: {
                value: !!this.isMobile,
            },
        };
        // 分割数
        const segments = 30;
        // 形状データを作成
        const bgGeometry = new PlaneBufferGeometry(1, 1, segments, segments);
        const bgMaterial = new ShaderMaterial({
            uniforms,
            vertexShader: photoBgVertexShader,
            fragmentShader: photoBgFragmentShader,
            transparent: true,
        });
        const bgMesh = new Mesh(bgGeometry, bgMaterial);
        return bgMesh;
    }
    update(index: number): void {
        // DomRect(x, y, width, height)等を取得
        if (this.rectList.length < this.meshList.length) {
            const rect = this.elms.images[index].getBoundingClientRect();
            this.rectList.push(rect);
        }
        this.scrollList.push({
            previous: 0,
            current: 0,
            ease: 0,
        });
        if (this.meshList.length > 0) {
            this.updateMesh(index);
        }
        if (this.bgMeshList.length > 0) {
            this.updateBgMesh(index);
            const bgMeshes = this.bgMeshList[index];
            for (const [index, bgMesh] of Object.entries(bgMeshes)) {
                const i = parseInt(index);
                const bgMaterial = this.getMaterial(bgMesh);
                // 背景色の設定
                const rgb = i > 0 ? '255, 135, 232' : '0, 190, 8';
                const color = new Color(`rgb(${rgb})`);
                bgMaterial.uniforms.uColor.value = new Vector3(color.r, color.g, color.b);
            }
        }
    }
    updateMesh(index: number): void {
        const winSizeW = this.winSize.width;
        const winSizeH = this.winSize.height;
        const mesh = this.meshList[index];
        const rect = this.rectList[index];
        const viewportW = this.viewport.width;
        const viewportH = this.viewport.height;
        // meshの大きさを更新
        mesh.scale.x = (viewportW * rect.width) / winSizeW;
        mesh.scale.y = (viewportH * rect.height) / winSizeH;
        // meshの位置更新
        mesh.position.x = -(viewportW / 2) + mesh.scale.x / 2 + (rect.left / winSizeW) * viewportW;
        mesh.position.y = viewportH / 2 - mesh.scale.y / 2 - (rect.top / winSizeH) * viewportH;
        mesh.position.z = 1;
        const material = this.getMaterial(this.meshList[index]);
        material.uniforms.uResolution.value = new Vector2(rect.width, rect.height);
    }
    updateBgMesh(index: number): void {
        const winSizeW = this.winSize.width;
        const winSizeH = this.winSize.height;
        const bgMeshes = this.bgMeshList[index];
        const rect = this.rectList[index];
        const viewportW = this.viewport.width;
        const viewportH = this.viewport.height;
        for (const [index, bgMesh] of Object.entries(bgMeshes)) {
            const i = parseInt(index);
            const diff = i > 0 ? -10 : 10;
            // meshの大きさを更新
            bgMesh.scale.x = (viewportW * rect.width) / winSizeW;
            bgMesh.scale.y = (viewportH * rect.height) / winSizeH;
            // meshの位置更新
            bgMesh.position.x = -(viewportW / 2) + bgMesh.scale.x / 2 + (rect.left / winSizeW) * viewportW + diff;
            bgMesh.position.y = viewportH / 2 - bgMesh.scale.y / 2 - (rect.top / winSizeH) * viewportH + diff;
            bgMesh.position.z = i > 0 ? -2 : -1;
            // 背景サイズの設定
            const bgMaterial = this.getMaterial(bgMesh);
            bgMaterial.uniforms.uResolution.value = new Vector2(rect.width, rect.height);
        }
    }
    handleResize(): void {
        this.setSize();
        // カメラのアスペクト比を正す
        if (this.three.camera) {
            this.three.camera.aspect = this.winSize.width / this.winSize.height;
            this.three.camera.updateProjectionMatrix();
            this.viewport = this.initViewport();
        }
        // レンダラーの大きさ更新
        if (this.three.renderer) {
            this.three.renderer.setSize(this.winSize.width, this.winSize.height);
            this.three.renderer.setPixelRatio(window.devicePixelRatio); // デバイスピクセル比
        }
        // メッシュの大きさ更新
        if (this.meshList.length > 0) {
            for (let i = 0; i < this.meshList.length; i++) {
                const currentRect = this.elms.images[i].getBoundingClientRect();
                this.rectList[i] = currentRect;
                const material = this.getMaterial(this.meshList[i]);
                material.uniforms.uResolution.value = new Vector2(currentRect.width, currentRect.height);
                this.update(i);
            }
        }
        this.elms = {
            canvas: document.querySelector('[data-study="canvas"]'),
            link: document.querySelectorAll('[data-study="link"]'),
            images: document.querySelectorAll('[data-study="image"]'),
            mv: document.querySelector('.p-index-mv'),
            expansion: document.querySelector('[data-expansion="canvas"]'),
            horizontalList: document.querySelector('[data-horizontal="list"]'),
        };
    }
    render(): void {
        this.animFrame = requestAnimationFrame(this.render.bind(this));
        this.moveImages();
        // 画面に描画する
        this.three.renderer.render(this.three.scene, this.three.camera);
    }
    cancelAnimFrame(): void {
        cancelAnimationFrame(this.animFrame);
        this.three.scene.clear();
        for (const [index, mesh] of Object.entries(this.meshList)) {
            const i = parseInt(index);
            const material = this.getMaterial(mesh);
            material.dispose();
            mesh.geometry.dispose();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const [_, bgMesh] of Object.entries(this.bgMeshList[i])) {
                const bgMaterial = this.getMaterial(bgMesh);
                // eslint-disable-next-line no-unused-expressions
                bgMaterial.dispose;
                bgMesh.geometry.dispose();
            }
        }
        this.three.renderer.dispose();
        this.three.renderer.domElement.remove();
        this.three.renderer = null;
        // this.three.renderer.forceContextLoss();
    }
    setIsMobile(): void {
        for (const [index, mesh] of Object.entries(this.meshList)) {
            const i = parseInt(index);
            const material = this.getMaterial(mesh);
            material.uniforms.uIsMobile.value = !!this.isMobile;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const [_, bgMesh] of Object.entries(this.bgMeshList[i])) {
                const bgMaterial = this.getMaterial(bgMesh);
                bgMaterial.uniforms.uIsMobile.value = !!this.isMobile;
            }
        }
    }
    // スクロールに合わせて画像を動かす
    moveImages(): void {
        // console.log(document.querySelector('.p-index-study').getBoundingClientRect().top);
        const targetY = window.scrollY - this.elms.mv.clientHeight;
        // const targetY = Math.abs(document.querySelector('.p-index-study').getBoundingClientRect().top);
        const duration = 0.1;

        const studyList = this.elms.horizontalList;
        const scrollArea = this.isMobile
            ? studyList.clientHeight - window.innerHeight
            : studyList.clientWidth - window.innerWidth * 0.5;
        this.isLast = targetY > scrollArea;

        for (const [index, mesh] of Object.entries(this.meshList)) {
            const i = parseInt(index);
            const scroll = this.scrollList[i];

            const posX = this.getPosX(i);
            const posY = this.getPosY(i);

            if (targetY >= 0) scroll.current = this.isMobile ? posY : posX;

            const tl = gsap.timeline({
                paused: true,
            });
            if (targetY > 0 && !this.isLast) {
                scroll.previous = lerp(scroll.previous, scroll.current, 0.09);
                const material = this.getMaterial(mesh);
                material.uniforms.uTime.value = scroll.current - scroll.previous;
                const timeline = tl.to(
                    mesh.position,
                    {
                        duration,
                        x: this.isMobile ? posX : scroll.previous,
                        y: this.isMobile ? posY : posY,
                    },
                    0
                );
                for (const [index, bgMesh] of Object.entries(this.bgMeshList[i])) {
                    const diff = parseInt(index) > 0 ? -10 : 10;
                    const bgMaterial = this.getMaterial(bgMesh);
                    bgMaterial.uniforms.uTime.value = scroll.current - scroll.previous;
                    timeline.to(
                        bgMesh.position,
                        {
                            duration,
                            x: this.isMobile ? posX + diff : scroll.previous + diff,
                            y: this.isMobile ? posY + diff : posY + diff,
                        },
                        '<'
                    );
                }
                timeline.play();
            } else {
                const material = this.getMaterial(mesh);
                material.uniforms.uTime.value = 0;
                scroll.previous = this.isMobile ? posY : posX;
                if (mesh.position.y !== scroll.previous) {
                    const timeline = tl.to(mesh.position, {
                        duration: 1,
                        x: posX,
                        y: posY,
                    });
                    for (const [index, bgMesh] of Object.entries(this.bgMeshList[i])) {
                        const diff = parseInt(index) > 0 ? -10 : 10;
                        const bgMaterial = this.getMaterial(bgMesh);
                        bgMaterial.uniforms.uTime.value = 0;
                        timeline.to(
                            bgMesh.position,
                            {
                                duration: 1,
                                x: posX + diff,
                                y: posY + diff,
                            },
                            '<'
                        );
                    }
                    timeline.play();
                }
            }
        }
    }
    getPosX(index: number) {
        // 画像要素
        const currentRect = this.elms.images[index].getBoundingClientRect();
        const viewportW = this.viewport.width;
        const scaleX = this.meshList[index].scale.x;
        return -(viewportW / 2) + scaleX / 2 + (currentRect.left / this.winSize.width) * viewportW;
    }
    getPosY(index: number) {
        // 画像要素
        const currentRect = this.elms.images[index].getBoundingClientRect();
        const viewportH = this.viewport.height;
        const scaleY = this.meshList[index].scale.y;
        return viewportH / 2 - scaleY / 2 - (currentRect.top / this.winSize.height) * viewportH;
    }
    // スクロール
    handleScroll(): void {
        this.flg.isScroll = true;
        this.flg.isMove = false;
        // const targetY = Math.abs(document.querySelector('.p-index-study').getBoundingClientRect().top);
        const targetY = window.scrollY - this.elms.mv.clientHeight;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const [index, _] of Object.entries(this.rectList)) {
            const i = parseInt(index);
            // スクロール情報（current/previous/ease）
            const scroll = this.scrollList[i];
            const moveX = this.getPosX(i);
            const moveY = this.getPosY(i);
            this.meshList[i].position.x = moveX;
            this.meshList[i].position.y = moveY;
            for (const [index, bgMesh] of Object.entries(this.bgMeshList[i])) {
                const j = parseInt(index);
                const diff = j > 0 ? -10 : 10;
                bgMesh.position.y = moveY + diff;
            }
            if (targetY >= 0) scroll.current = this.isMobile ? moveY : moveX;
        }
        this.targetY = targetY;
    }
    handleMouse(e: MouseEvent): void {
        if (!this.flg.isScroll) this.flg.isMove = true;
        this.mouse = {
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: -(e.clientY / window.innerHeight) * 2 + 1,
        };
    }
    handleClick(e: MouseEvent): void {
        this.mouse = {
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: -(e.clientY / window.innerHeight) * 2 + 1,
        };
    }
    getMaterial(mesh: Mesh): ShaderMaterial {
        return <ShaderMaterial>mesh.material;
    }
}
