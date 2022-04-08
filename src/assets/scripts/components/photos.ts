import * as THREE from 'three';
// import { BufferGeometry, Mesh } from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap, { Power2 } from 'gsap';
import photoVertexShader from '../glsl/photo/vertexshader.vert';
import photoFragmentShader from '../glsl/photo/fragmentShader.frag';
import photoBgVertexShader from '../glsl/photo/bg/vertexshader.vert';
import photoBgFragmentShader from '../glsl/photo/bg/fragmentShader.frag';
import { throttle } from '../utils/throttle';
import { lerp } from '../utils/math';
import { Vector2, Vector3 } from 'three';
import { debounce } from '../utils/debounce';

interface ThreeNumber {
    [key: string]: number;
}

interface ScrollOptions {
    current: number;
    previous: number;
    ease: number;
}

interface UniformOptions {
    [uniform: string]: THREE.IUniform;
}

export default class Photo {
    three: {
        camera: THREE.PerspectiveCamera;
        scene: THREE.Scene;
        mesh: THREE.Mesh;
        bgMesh: THREE.Mesh;
        textureList: THREE.Texture[];
        renderer: THREE.WebGLRenderer;
        object: THREE.Object3D;
        // control: OrbitControls | null;
        clock: THREE.Clock;
        raycaster: THREE.Raycaster;
    };
    elms: {
        canvas: HTMLCanvasElement;
        images: NodeListOf<HTMLImageElement>;
        mv: HTMLCanvasElement;
    };
    mouse: {
        x: number;
        y: number;
    };
    winSize: ThreeNumber;
    time: ThreeNumber;
    viewport!: ThreeNumber;
    rectList: DOMRect[];
    flg: {
        isMove: boolean;
    };
    scrollList: ScrollOptions[];
    meshList: THREE.Mesh[];
    bgMeshList: THREE.Mesh[][];
    srcList: string[];
    imagePath: string;
    targetY: number;
    constructor() {
        this.three = {
            camera: null,
            scene: new THREE.Scene(),
            mesh: null,
            bgMesh: null,
            textureList: [],
            renderer: null,
            object: null,
            // control: null,
            clock: new THREE.Clock(),
            raycaster: new THREE.Raycaster(),
        };
        this.rectList = [];
        this.elms = {
            canvas: document.querySelector('[data-study="canvas"]'),
            images: document.querySelectorAll('[data-study="image"]'),
            mv: document.querySelector('.p-mv'),
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
            isMove: false,
        };
        this.scrollList = [];
        this.meshList = [];
        this.bgMeshList = [];
        this.srcList = [];
        this.imagePath = 'assets/images/pc/';
        this.targetY = 0;
    }
    init(): void {
        for (const el of Object.values(this.elms)) {
            if (!el) return;
        }
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
        // 画像を読み込む
        this.load();
        // 描写する
        this.render();
        // ハンドリング
        this.handleEvent();
    }
    async load(): Promise<void> {
        for (const [index, image] of Object.entries(this.elms.images)) {
            const imageName = image.getAttribute('data-study-image').trim();
            if (imageName) await this.texture(index, imageName);
        }
    }
    async texture(index: string, imageName: string): Promise<THREE.Texture> {
        return new Promise((resolve) => {
            const imageSrc = `/_nuxt/src/assets/images/pc/${imageName}`;
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(imageSrc, async (texture) => {
                this.three.textureList.push(texture);
                await this.set(parseInt(index));
                resolve(texture);
            });
        });
    }
    async set(index: number): Promise<void> {
        // メッシュを作成
        this.three.mesh = this.initMesh(index);
        this.meshList.push(this.three.mesh);
        // this.bgMeshList.push(this.three.bgMesh);
        // this.three.object = new THREE.Object3D().add(this.three.mesh, this.three.bgMesh);
        // メッシュをシーンに追加
        this.three.scene.add(this.three.mesh);
        // this.three.scene.add(this.bgMeshList[index]);
        // HTML要素の情報を取得、3Dモデルの更新
        this.update(index);
        this.scrollList[index].previous = this.meshList[index].position.x;
    }
    initCamera(): THREE.PerspectiveCamera {
        // PerspectiveCamera: 遠近感が適用されるカメラ
        const camera = new THREE.PerspectiveCamera(
            45, // 画角
            this.winSize.width / this.winSize.height, // 縦横比
            0.1, // 視点から最も近い面までの距離
            2000 // 視点から最も遠い面までの距離
        );
        // カメラ位置を設定
        camera.position.set(0, 0, 1000);
        // どの位置からでも指定した座標に強制的に向かせることができる命令
        // camera.lookAt(this.three.scene.position);
        return camera;
    }
    initRenderer(): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({
            alpha: true, // 背景透明
            antialias: true, // 物体の輪郭を滑らかにする
        });
        /**
         * デスクトップでは、メインディスプレイ・サブディスプレイでPixelRatioの異なる可能性がある。
         * ➡ リサイズイベントでsetPixelRatioメソッドでを使って更新
         * https://ics.media/tutorial-three/renderer_resize/
         */
        renderer.setPixelRatio(window.devicePixelRatio); // デバイスピクセル比
        renderer.setClearColor(0xffffff, 0); // 背景透過
        renderer.setSize(this.winSize.width, this.winSize.height);
        return renderer;
    }
    initViewport(): ThreeNumber {
        if (this.three.camera) {
            // fov : Field OF View (カメラの位置から見えるシーンの範囲)
            // 角度をラジアンに変更
            const fov = (this.three.camera.fov * Math.PI) / 180;
            // https://kou.benesse.co.jp/nigate/math/a14m0313.html
            // 高さの半分 / 奥行(= Math.tan(ラジアン)) * 奥行 * 2
            const height = Math.tan(fov / 2) * this.three.camera.position.z * 2;
            const width = height * this.three.camera.aspect;
            const viewport = {
                width: width,
                height: height,
            };
            return viewport;
        }
    }
    initMesh(index: number): THREE.Mesh {
        const uniforms = {
            uResolution: {
                value: new THREE.Vector2(0.0, 0.0), // 画面サイズ
            },
            uImageResolution: {
                value: new THREE.Vector2(1280, 853), // 画像サイズ
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
        };
        // 分割数
        const segments = 30;
        // 形状データを作成
        const geometry = new THREE.PlaneBufferGeometry(1, 1, segments, segments);
        // 質感を作成
        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: photoVertexShader,
            fragmentShader: photoFragmentShader,
            transparent: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        const bgMeshList = [] as THREE.Mesh[];
        for (let i = 0; i < 2; i++) {
            const bgMesh = this.initBgMesh();
            bgMeshList.push(bgMesh);
            this.three.scene.add(bgMesh);
        }
        console.log(bgMeshList);
        this.bgMeshList.push(bgMeshList);
        return mesh;
    }
    initBgMesh(): THREE.Mesh {
        const uniforms = {
            uResolution: {
                value: new THREE.Vector2(0.0, 0.0), // 画面サイズ
            },
            uImageResolution: {
                value: new THREE.Vector2(1280, 853), // 画像サイズ
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
                value: new THREE.Vector3(1.0, 0.1, 1.0),
            },
        };
        // 分割数
        const segments = 30;
        // 形状データを作成
        const bgGeometry = new THREE.PlaneBufferGeometry(1, 1, segments, segments);
        const bgMaterial = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: photoBgVertexShader,
            fragmentShader: photoBgFragmentShader,
            transparent: true,
        });
        const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);

        return bgMesh;
    }
    update(index: number): void {
        // DomRect(x, y, width, height)等を取得
        const rect = this.elms.images[index].getBoundingClientRect();
        this.rectList.push(rect);
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
                const color = new THREE.Color(`rgb(${rgb})`);
                bgMaterial.uniforms.uColor.value = new Vector3(color.r, color.g, color.b);
            }
        }
    }
    updateMesh(index: number): void {
        const winSizeW = this.winSize.width;
        const winSizeH = this.winSize.height;
        const mesh = this.meshList[index];
        const rect = this.rectList[index];
        // meshの大きさを更新
        mesh.scale.x = (this.viewport.width * rect.width) / winSizeW;
        mesh.scale.y = (this.viewport.height * rect.height) / winSizeH;
        // meshの位置更新
        mesh.position.x = rect.left - rect.width / 2 - winSizeW / 2;
        mesh.position.y = winSizeH / 2 - rect.top - rect.height / 2;
        const material = this.getMaterial(this.meshList[index]);
        material.uniforms.uResolution.value = new Vector2(rect.width, rect.height);
    }
    updateBgMesh(index: number): void {
        const winSizeW = this.winSize.width;
        const winSizeH = this.winSize.height;
        const bgMeshes = this.bgMeshList[index];
        const rect = this.rectList[index];
        for (const [index, bgMesh] of Object.entries(bgMeshes)) {
            const i = parseInt(index);
            const diff = i > 0 ? -10 : 10;
            // meshの大きさを更新
            bgMesh.scale.x = (this.viewport.width * rect.width) / winSizeW;
            bgMesh.scale.y = (this.viewport.height * rect.height) / winSizeH;
            // meshの位置更新
            bgMesh.position.x = rect.left - rect.width / 2 - winSizeW / 2 + diff;
            bgMesh.position.y = winSizeH / 2 - rect.top - rect.height / 2 + diff;
            bgMesh.position.z = i > 0 ? -2 : -1;
            // 背景サイズの設定
            const bgMaterial = this.getMaterial(bgMesh);
            bgMaterial.uniforms.uResolution.value = new Vector2(rect.width, rect.height);
        }
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
            debounce(() => {
                this.handleResize();
            }, 10),
            false
        );
        window.addEventListener(
            'mousemove',
            (e: MouseEvent) => {
                this.handleMouse(e);
            },
            false
        );
        window.addEventListener(
            'scroll',
            throttle(() => {
                this.handleScroll();
            }, 10),
            {
                capture: false,
                passive: true,
            }
        );
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
                console.log(currentRect.width);
            }
        }
    }
    render(): void {
        requestAnimationFrame(this.render.bind(this));
        this.moveImages();
        if (window.scrollY > this.elms.mv.scrollHeight) this.setRaycaster();
        // 画面に描画する
        this.three.renderer.render(this.three.scene, this.three.camera);
    }
    // スクロールに合わせて画像を動かす
    moveImages(): void {
        const targetY = window.scrollY - this.elms.mv.scrollHeight;
        for (const [index, mesh] of Object.entries(this.meshList)) {
            const i = parseInt(index);
            const scroll = this.scrollList[i];
            const tl = gsap.timeline({
                paused: true,
            });
            if (targetY >= 0) {
                scroll.previous = lerp(scroll.previous, scroll.current, 0.1);
                const material = this.getMaterial(mesh);
                material.uniforms.uTime.value = scroll.current - scroll.previous;
                tl.to(
                    mesh.position,
                    {
                        duration: 0.1,
                        x: scroll.previous,
                    },
                    0
                );
                for (const [index, bgMesh] of Object.entries(this.bgMeshList[i])) {
                    const diff = parseInt(index) > 0 ? -10 : 10;
                    const bgMaterial = this.getMaterial(bgMesh);
                    bgMaterial.uniforms.uTime.value = scroll.current - scroll.previous;
                    tl.to(
                        bgMesh.position,
                        {
                            duration: 0.1,
                            x: scroll.previous + diff,
                        },
                        '<'
                    );
                }
            } else {
                // 画像要素
                const currentRect = this.elms.images[i].getBoundingClientRect();
                const posX = currentRect.left - currentRect.width / 2 - this.winSize.width / 2;
                scroll.previous = posX;
                const material = this.getMaterial(mesh);
                material.uniforms.uTime.value = 0;
                if (mesh.position.x !== scroll.previous) {
                    tl.to(mesh.position, {
                        duration: 0.5,
                        x: posX,
                    });
                    for (const [index, bgMesh] of Object.entries(this.bgMeshList[i])) {
                        const diff = parseInt(index) > 0 ? -10 : 10;
                        const bgMaterial = this.getMaterial(bgMesh);
                        bgMaterial.uniforms.uTime.value = scroll.current - scroll.previous;
                        tl.to(
                            bgMesh.position,
                            {
                                duration: 0.5,
                                x: posX + diff,
                            },
                            '<'
                        );
                    }
                }
            }
            tl.play();
        }
    }
    setRaycaster(): void {
        this.three.raycaster.setFromCamera(this.mouse, this.three.camera);
        // 交差するオブジェクトを計算
        const intersectObjects = this.three.raycaster.intersectObjects(this.three.scene.children);
        for (const [index, object] of Object.entries(intersectObjects)) {
            const intersectObject = <THREE.Mesh>object.object;
            const intersectMaterial = this.getMaterial(intersectObject);
            // console.log(index);
            for (const mesh of Object.values(this.meshList)) {
                const material = this.getMaterial(mesh);
                if (intersectMaterial.id === material.id) {
                    material.uniforms.uMoz.value = lerp(material.uniforms.uMoz.value, 0.0, 0.08);
                }
            }
        }
        if (intersectObjects.length === 0) {
            for (const mesh of Object.values(this.meshList)) {
                const material = this.getMaterial(mesh);
                material.uniforms.uMoz.value = lerp(material.uniforms.uMoz.value, 0.02, 0.2);
            }
        }
    }
    // スクロール
    handleScroll(): void {
        const targetY = window.scrollY - this.elms.mv.scrollHeight;
        for (const [index, rect] of Object.entries(this.rectList)) {
            const i = parseInt(index);
            // スクロール情報（current/previous/ease）
            const scroll = this.scrollList[i];
            // 画像要素
            const currentRect = this.elms.images[i].getBoundingClientRect();
            this.meshList[i].position.y = this.winSize.height / 2 - currentRect.top - currentRect.height / 2;
            for (const [index, bgMesh] of Object.entries(this.bgMeshList[i])) {
                const j = parseInt(index);
                const diff = j > 0 ? -10 : 10;
                bgMesh.position.y = this.winSize.height / 2 - currentRect.top - currentRect.height / 2 + diff;
            }
            // 画像表示位置
            const imagePos = currentRect.left - rect.width / 2 - this.winSize.width / 2;
            if (targetY >= 0) {
                scroll.current =
                    targetY > this.targetY ? Math.min(imagePos, scroll.previous) : Math.max(imagePos, scroll.previous);
            }
        }
        this.targetY = targetY;
    }
    handleMouse(e: MouseEvent): void {
        this.mouse = {
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: -(e.clientY / window.innerHeight) * 2 + 1,
        };
    }
    getMaterial(mesh: THREE.Mesh): THREE.ShaderMaterial {
        return <THREE.ShaderMaterial>mesh.material;
    }
}
