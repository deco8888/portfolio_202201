import * as THREE from 'three';
import { Vector3 } from 'three';
import { addClass, isContains, removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';
import { lerp } from '../../../utils/math';
import Letter from '../../letter';

export default class Title extends Letter {
    layers: number;
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
    animFrame?: number;
    vector3: {
        x: number;
        y: number;
        z: number;
    };
    scroll: {
        y: number;
    };
    start: {
        x: number;
        y: number;
    };
    color: {
        front: string;
        back: string;
    };
    font: {
        wight: number;
        size: number;
        family: string;
    };
    vertical: number;
    horizontal: number;
    particleX: number[];
    text: string;
    elms: {
        study: HTMLElement;
    };
    isStudyArea: boolean;
    max: number;
    count: number;
    object: {
        previous: {
            [key: string]: number;
        };
        current: {
            [key: string]: number;
        };
    };
    test: {
        [key: string]: number;
    };
    constructor() {
        super();
        this.borderColor = 'rgb(152 120 210)';
        this.textImage = {
            canvas: null,
            ctx: null,
            data: null,
        };
        this.layers = 4;
        this.target = {
            rotation: {
                x: -0.3,
                y: 0,
            },
        };
        this.rotation = {
            x: 3,
            y: 0.5,
        };
        this.animFrame = 0;
        this.vector3 = {
            x: 0,
            y: 0,
            z: 0,
        };
        this.scroll = {
            y: 0,
        };
        this.start = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
        };
        this.color = {
            front: '#906cd1',
            back: '#f9b97c', //'#ff9800',
        };
        this.font = {
            wight: 800,
            size: 150,
            family: 'Nippo',
        };
        this.vertical = 0;
        this.horizontal = 0;
        this.particleX = [];
        this.text = 'PORTFOLIO';
        this.elms = {
            study: document.querySelector('.p-index-study'),
        };
        this.isStudyArea = false;
        this.max = 0;
        this.count = 0;
        this.object = {
            previous: {
                x: 0,
                y: 0,
            },
            current: {
                x: 0,
                y: 0,
            },
        };
        this.test = null;
    }
    init(): void {
        this.canvas = document.querySelector('[data-canvas="title"]');
        // カメラ・シーン・レンダラー等の準備
        this.prepare();
        this.setBorderStyle('152 120 210');
        // 描写する
        this.render();
        this.three.clock = new THREE.Clock();
        this.three.clock.start();
    }
    render(): void {
        this.animFrame = requestAnimationFrame(this.render.bind(this));
        if (this.three.clock) {
            // delta: 変化量
            this.time.delta = this.three.clock.getDelta();
            this.time.total += this.time.delta;
        }
        // if (this.three.object) this.three.object.rotation.y += 0.005;
        // 画面に描画する
        if (this.three.renderer && this.three.camera) this.three.renderer.render(this.three.scene, this.three.camera);
        if (this.three.points) this.update();
        if (this.three.object) {
            this.rotate();
        }
        if (this.three.object) {
            if (this.isStudyArea) {
                let current = lerp(this.object.previous.x, this.object.current.x, 0.08);
                current = Math.min(0, current);
                current = Math.max(-window.innerWidth * 0.25, current);
                this.three.object.position.setX(current);
                if (current >= -window.innerWidth * 0.25) {
                    let currentY = lerp(this.object.previous.y, this.object.current.y, 0.08);
                    currentY = Math.max(0, currentY);
                    currentY = Math.min(window.innerHeight * 0.35, currentY);
                    this.three.object.position.setY(currentY);
                }
            }
            if (this.horizontal === 0 && this.object.current.x > 0) {
                let current = lerp(this.object.previous.x, this.object.current.x, 1);
                current = Math.min(0, current);
                current = Math.max(-window.innerWidth, current);
                this.three.object.position.setX(current);
            }
            if (this.vertical === 0 && this.object.current.y < 0) {
                let currentY = lerp(this.object.previous.y, this.object.current.y, 1);
                currentY = Math.max(0, currentY);
                currentY = Math.min(window.innerHeight * 0.35, currentY);
                this.three.object.position.setY(currentY);
            }
            this.object.previous.x = this.three.object.position.x;
            this.object.previous.y = this.three.object.position.y;
        }
    }
    update(): void {
        const geometry = <THREE.BufferGeometry>this.three.points.geometry;
        const geometryPosition = geometry.attributes.position;
        const positionList = geometryPosition.array;
        const promiseList = this.title.secondList.position;
        for (let i = 0; i < positionList.length / 3; i++) {
            const previousX = geometryPosition.getX(i);
            const previousY = geometryPosition.getY(i);
            const lastX = promiseList[i * 2];
            const lastY = promiseList[i * 2 + 1];
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
    rotate() {
        this.three.object.rotation.y =
            scrollY === 0
                ? lerp(this.three.object.rotation.y, 0, 0.1)
                : lerp(this.three.object.rotation.y, this.rotation.y, 0.1);
    }
    async handleScroll(): Promise<void> {
        const scrollY = window.scrollY;
        const study = document.querySelector('.p-index-study').getBoundingClientRect().top + scrollY;
        if (!isContains(this.elms.study, hasClass.active)) {
            if (scrollY < study * 0.85) {
                if (scrollY === 0) {
                    this.rotation.y = 0;
                } else if (scrollY > this.scroll.y) {
                    this.rotation.y = Math.max(this.three.object.rotation.y + 0.3, 0);
                } else if (scrollY < this.scroll.y) {
                    this.rotation.y = Math.max(this.three.object.rotation.y - 0.3, 0);
                }
            } else if (scrollY >= study * 0.85) {
                addClass(this.elms.study, hasClass.active);
                this.rotation.y = 0;
                this.horizontal = 0;
                await this.initValue();
                this.text = 'STUDY';
                this.color = {
                    front: '#00be08',
                    back: '#ff87e8',
                };
                this.setBorderStyle('112 216 114');
                await this.getTitleInfo();
                this.change();
            }
        }
        const current = scrollY - document.querySelector('.p-index-mv').clientHeight;
        if (isContains(this.elms.study, hasClass.active)) {
            if (scrollY > study * 0.85) {
                if (scrollY > this.scroll.y) {
                    this.horizontal = current > window.innerHeight / 2 ? window.innerWidth * -0.2 : 0;
                    this.vertical = current > window.innerHeight ? window.innerHeight * 0.2 : 0;
                } else if (scrollY < this.scroll.y) {
                    this.horizontal = current < window.innerHeight / 2 ? window.innerWidth * 0.2 : 0;
                    this.vertical = current < window.innerHeight ? window.innerHeight * -0.2 : 0;
                }
                this.object.current.x = this.three.object.position.x + this.horizontal;
                this.object.current.y = this.three.object.position.y + this.vertical;
                this.isStudyArea = true;
            }
            if (scrollY < study * 0.85) {
                removeClass(this.elms.study, hasClass.active);
                this.isStudyArea = false;
                this.three.object.position.x = 0;
                this.three.object.position.y = 0;
                this.horizontal = 0;
                await this.initValue();
                this.text = 'PORTFOLIO';
                this.color = {
                    front: '#906cd1',
                    back: '#f9b97c',
                };
                this.setBorderStyle('152 120 210');
                await this.getTitleInfo();
                this.change();
            }
        }
        this.scroll.y = scrollY;
    }
    change(): void {
        const geometry = <THREE.BufferGeometry>this.three.points.geometry;
        for (const [attribute, list] of Object.entries(this.title.firstList)) {
            geometry.deleteAttribute(attribute);
            const size = attribute === 'alpha' ? 1 : 3;
            this.setAttribute(attribute, list, size);
        }
        const geometryPosition = geometry.attributes.position;
        geometryPosition.needsUpdate = true;
    }
    handleMove(e: MouseEvent): void {
        if (this.three.object) this.three.object.rotation.x = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    }
    async initValue(): Promise<void> {
        await this.initCommonValue();
        this.font = {
            wight: 800,
            size: 150,
            family: 'Nippo',
        };
    }
}
