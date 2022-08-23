import * as THREE from 'three';
import gsap, { Power2 } from 'gsap';
import { lerp } from '../../../utils/math';
import Letter from '../../letter';
import { BufferGeometry, Material, ShaderMaterial } from 'three';

export default class Title extends Letter {
    speed: number;
    vector3: {
        x: number;
        y: number;
        z: number;
    };
    scroll: {
        y: number;
    };
    constructor() {
        super();
        this.borderColor = 'rgb(101 141 172)'; //'rgb(81 162 247)';
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
            front: '#facb04',
            back: '#7caed4', //#5174b3',
        };
        this.font = {
            wight: 900,
            size: this.getFontSize(),
            family: "'Gill Sans', sans-serif", //"'Red Hat Display', sans-serif", //"Arial", //"'Nippo', sans-serif",
            threshold: this.isMobile ? 0.18 : 0.12,
        };
        this.text = 'CONTACT';
        this.isFirst = false;
        this.init();
    }
    getFontSize(): number {
        return this.isMobile ? this.viewport.width * 0.15 : this.viewport.width * 0.1;
    }
    init(): void {
        this.handleMove({ clientX: 0, clientY: 0 });
        this.canvas = document.querySelector('[data-expansion="expansion"]');
        // カメラ・シーン・レンダラー等の準備
        this.prepare();
        this.font.size = this.getFontSize();
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
    draw(): void {
        this.createTextImage();
        // this.three.clock = new THREE.Clock();
        // this.three.clock.start();
    }
    render(): void {
        this.animFrame = requestAnimationFrame(this.render.bind(this));
        // if (this.three.object) this.three.object.rotation.y += 0.005;
        // 画面に描画する
        if (this.three.renderer && this.three.camera) this.three.renderer.render(this.three.scene, this.three.camera);
        if (this.three.points) {
            this.update();
            if (this.raycaster && !this.isMobile && this.three.points.geometry) this.raycast();
        }
        if (this.three.object && this.three.object.position.y === 0) {
            this.three.object.position.y = this.viewport.height * 0.3;
        }
    }
    update(): void {
        const geometry = <BufferGeometry>this.three.points.geometry;
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
        if (this.three.renderer) {
            this.three.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.three.renderer.setSize(this.winSize.width, this.winSize.height);
        }
        if (this.three.camera) {
            // カメラのアスペクト比を正す
            this.three.camera.aspect = this.winSize.width / this.winSize.height;
            this.three.camera.updateProjectionMatrix();
        }
    }
    // handleMove(e: MouseEvent): void {
    //     this.three.object.rotation.x = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    //     if (this.textImage.canvas) {
    //         this.mouse.x = e.clientX - this.winSize.width * 0.5;
    //         this.mouse.y = -(e.clientY - this.winSize.height * 0.5);
    //     }
    //     if (this.three.points) {
    //         const geometryPosition = this.three.points.geometry.attributes.position;
    //         geometryPosition.needsUpdate = true;
    //     }
    // }
    async removeTitle(): Promise<void> {
        gsap.to(this.three.object.scale, {
            duration: 0.5,
            ease: Power2.easeOut,
            x: 0,
            y: 0,
            z: 0,
            onComplete: () => {
                this.three.scene.remove(this.three.object);
                this.three.object.remove(this.three.points);
                this.three.object = null;
                const material = <ShaderMaterial>this.three.points.material;
                material.dispose();
                this.three.points.geometry.dispose();
                this.three.points = null;
                cancelAnimationFrame(this.animFrame);
                this.initCommonValue();
            },
        });
    }
    async initValue(): Promise<void> {
        await this.initCommonValue();
    }
}
