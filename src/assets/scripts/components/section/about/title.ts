import * as THREE from 'three';
import { lerp } from '../../../utils/math';
import Letter from '~/assets/scripts/modules/letter';
import { radians } from '../../../utils/helper';
import { PerspectiveCamera } from 'three';

export default class Title extends Letter {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    borderColor: string;
    textImage: {
        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        data: ImageData;
    };
    layers: number;
    gap: number;
    size: number;
    target: {
        rotation: {
            x: number;
            y: number;
        };
    };
    rotation: {
        x: number;
        y: number;
    };
    speed: number;
    animFrame?: number;
    vector3: {
        x: number;
        y: number;
        z: number;
    };
    scroll: {
        y: number;
    };
    color: {
        front: string;
        back: string;
    };
    horizontal: number;
    particleX: number[];
    text: string;
    elms: {
        study: HTMLElement;
    };
    isStudyArea: boolean;
    constructor() {
        super();
        this.borderColor = 'rgb(81 162 247)';
        this.textImage = {
            canvas: null,
            ctx: null,
            data: null,
        };
        this.layers = 4;
        this.gap = 0;
        this.size = 0.2;
        this.target = {
            rotation: {
                x: 0,
                y: 0.1,
            },
        };
        this.rotation = {
            x: 0,
            y: 0.5,
        };
        this.speed = 50;
        this.animFrame = 0;
        this.vector3 = {
            x: 0,
            y: 0,
            z: 0,
        };
        this.scroll = {
            y: 0,
        };
        this.color = {
            front: '#51a2f7',
            back: '#e96747',
        };
        this.font = {
            wight: 900,
            size: this.getFontSize(),
            family: "'Gill Sans', sans-serif", //"'Red Hat Display', sans-serif", //"Arial", //"'Nippo', sans-serif",
            threshold: this.isMobile ? 0.18 : 0.12,
        };
        this.text = 'ABOUT';
    }
    getFontSize(): number {
        return this.isMobile ? this.viewport.width * 0.15 : this.viewport.width * 0.1;
    }
    init(): void {
        this.canvas = document.querySelector('[data-canvas="title"]');
        // カメラ・シーン・レンダラー等の準備
        this.prepare();
        this.font.size = this.getFontSize();
        this.createTextImage();
        this.setBorderStyle('about');
        // 描写する
        this.render();
        this.three.clock = new THREE.Clock();
        this.three.clock.start();
    }
    async prepare(): Promise<void> {
        this.setSize();
        // カメラを作成
        this.three.camera = this.initCamera();
        // カメラをシーンに追加
        this.three.scene.add(this.three.camera);
        // レンダラーを作成
        this.three.renderer = this.initRenderer();
        // HTMLに追加
        this.canvas.appendChild(this.three.renderer.domElement);
        // ビューポート計算
        this.viewport = this.initViewport();
    }
    initCamera(): PerspectiveCamera {
        const camera = new PerspectiveCamera(
            45, // 画角
            this.winSize.width / this.winSize.height, // 縦横比
            0.1, // 視点から最も近い面までの距離
            10000 // 視点から最も遠い面までの距離
        );
        const posY = this.isMobile ? this.winSize.height / 2 : 0;
        camera.position.set(0, posY, 1000);
        // どの位置からでも指定した座標に強制的に向かせることができる命令
        camera.lookAt(this.three.scene.position);
        camera.updateProjectionMatrix();
        return camera;
    }
    render(): void {
        requestAnimationFrame(this.render.bind(this));
        if (this.three.clock) {
            // delta: 変化量
            this.time.delta = this.three.clock.getDelta();
            this.time.total += this.time.delta;
        }
        if (this.three.object) this.three.object.rotation.y += 0.01;
        // 画面に描画する
        if (this.three.renderer && this.three.camera) this.three.renderer.render(this.three.scene, this.three.camera);
        if (this.three.points) this.update();
        // this.three.object.rotateX
        if (this.three.object && this.three.object.position.x === 0) {
            if (this.isMobile) {
                this.three.object.position.y = this.winSize.height * 0.48;
            } else {
                const slope = radians(0);
                const diff = Math.cos(slope) * this.textImage.canvas.width;
                const space = (this.viewport.width * 0.5 - diff) / 2;
                this.three.object.rotation.y = slope;
                this.three.object.position.x = -space - this.textImage.canvas.width / 2;
                this.three.object.position.z = -this.textImage.canvas.width / 4;
            }
        }
    }
    update(): void {
        const geometry = <THREE.BufferGeometry>this.three.points.geometry;
        const geometryPosition = geometry.attributes.position;
        const positionList = geometryPosition.array;
        const secondList = this.title.secondList.position;
        for (let i = 0; i < positionList.length / 3; i++) {
            const previousX = geometryPosition.getX(i);
            const previousY = geometryPosition.getY(i);
            const lastX = secondList[i * 2];
            const lastY = secondList[i * 2 + 1];
            const currentX = lerp(previousX, lastX, 0.1);
            const currentY = lerp(previousY, lastY, 0.08);
            geometryPosition.setX(i, currentX);
            geometryPosition.setY(i, currentY);
            geometryPosition.needsUpdate = true;
        }
    }
    handleResize(): void {
        this.setSize();
        if (this.three.camera) {
            // カメラのアスペクト比を正す
            this.three.camera.aspect = this.winSize.width / this.winSize.height;
            this.three.camera.updateProjectionMatrix();
            if (this.three.renderer) this.three.renderer.setSize(this.winSize.width, this.winSize.height);
        }
    }
}
