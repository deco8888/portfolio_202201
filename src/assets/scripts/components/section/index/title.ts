import { BufferGeometry, Clock, Vector3 } from 'three';
import { addClass, isContains, removeClass } from '~/assets/scripts/utils/classList';
import { hasClass } from '~/assets/scripts/utils/hasClass';
import { lerp } from '~/assets/scripts/utils/math';
import { isMobile } from '~/assets/scripts/modules/isMobile';
import Letter from '~/assets/scripts/modules/letter';

interface PointsListType {
    [key: number]: Vector3[];
}

export default class Title extends Letter {
    animFrame?: number;
    scroll: {
        y: number;
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
    pointsList: PointsListType;
    pointsInfo: {
        previous: {
            [key: string]: number;
        };
        current: {
            [key: string]: number;
        };
    };
    pointsIndex: number;
    isMobile: boolean;
    constructor() {
        super();
        this.isMobile = isMobile();
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
            back: '#f9b97c', //'#f9b97c', //'#ff9800',
        };
        this.font = {
            wight: 900,
            size: this.getFontSize(),
            family: "'Gill Sans', sans-serif", //"'Red Hat Display', sans-serif", //"Arial", //"'Nippo', sans-serif",
            threshold: this.isMobile ? 0.18 : 0.12,
        };
        this.vertical = 0;
        this.horizontal = 0;
        this.particleX = [];
        this.text = this.isMobile ? 'PORT¥nFOLIO' : 'PORT¥nFOLIO';
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
        this.pointsList = {};
        this.pointsInfo = {
            previous: {
                x: 0,
                y: 0,
                z: 0,
            },
            current: {
                x: 0,
                y: 0,
                z: 0,
            },
        };
        this.pointsIndex = 0;
    }
    getFontSize(): number {
        return this.viewport.width * this.font.threshold;
    }
    async init(): Promise<void> {
        this.handleMove({ clientX: 0, clientY: 0 });
        this.canvas = document.querySelector('[data-canvas="title"]');
        // カメラ・シーン・レンダラー等の準備
        await this.prepare();
        this.font.size = this.viewport.width * this.font.threshold;
        await this.createTextImage();
    }
    startAnim(): void {
        if (this.flg) this.setDiffusion();
        // 描写する
        this.render();
        this.three.clock = new Clock();
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
        if (this.three.object) {
            this.rotate();
            this.moveInStudyArea();
        }
        if (this.three.points) {
            // this.draw();
            this.update();
            this.addTime();
            if (this.raycaster && !this.isMobile) this.raycast();
        }
    }
    update(): void {
        const geometry = <BufferGeometry>this.three.points.geometry;
        const geometryPosition = geometry.attributes.position;
        const positionList = geometryPosition.array;
        const promiseList = this.title.secondList.position;
        for (let i = 0; i < positionList.length / 3; i++) {
            const previousX = geometryPosition.getX(i);
            const previousY = geometryPosition.getY(i);
            const lastX = promiseList[i * 2];
            const lastY = promiseList[i * 2 + 1] + 0; //(this.isStudyArea ? window.innerHeight * 0.5 : 0);
            const currentX = lerp(previousX, lastX, 0.1);
            const currentY = lerp(previousY, lastY, 0.08);
            geometryPosition.setX(i, currentX);
            geometryPosition.setY(i, currentY);
            geometryPosition.needsUpdate = true;
        }
    }
    moveInStudyArea(): void {
        const horizontal = this.isMobile ? -this.viewport.width : -this.viewport.width * 0.22;
        const amp = this.isMobile ? 0.05 : 0.08;
        const previous = this.object.previous;
        const current = this.object.current;
        if (this.isStudyArea) {
            let currentX = lerp(previous.x, current.x, amp);
            let currentY = lerp(previous.y, current.y, amp);
            if (currentX > horizontal || currentY <= 0) this.getCurrentX(amp);
            if (currentX <= horizontal || currentY > 0) this.getCurrentY(amp);
        }
        if (this.horizontal === 0 && current.x > 0) this.getCurrentX(1);
        if (this.vertical === 0 && current.y < 0) this.getCurrentY(1);
        previous.x = this.three.object.position.x;
        previous.y = this.three.object.position.y;
    }
    getCurrentX(amp: number) {
        const horizontal = this.isMobile ? -this.viewport.width : -this.viewport.width * 0.22;
        let currentX = lerp(this.object.previous.x, this.object.current.x, amp);
        currentX = Math.min(0, currentX);
        currentX = Math.max(horizontal, currentX);
        this.three.object.position.setX(currentX);
    }
    getCurrentY(amp: number) {
        const vertical = this.viewport.height * 0.4;
        let currentY = lerp(this.object.previous.y, this.object.current.y, amp);
        currentY = Math.max(0, currentY);
        currentY = Math.min(vertical, currentY);
        this.three.object.position.setY(currentY);
    }
    handleResize(): void {
        this.onResize();
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
        const studyList = document.querySelector('[data-horizontal="list"]').clientWidth - window.innerWidth;
        const mvThreshold = this.isMobile ? 0.65 : 0.85;
        if (!isContains(this.elms.study, hasClass.active)) {
            if (scrollY < study * mvThreshold) {
                if (scrollY === 0) {
                    this.rotation.y = 0;
                } else if (scrollY > this.scroll.y) {
                    this.rotation.y = this.three.object.rotation.y + 0.5;
                } else if (scrollY < this.scroll.y) {
                    this.rotation.y = this.three.object.rotation.y - 0.5;
                }
            } else if (scrollY >= study * mvThreshold) {
                addClass(this.elms.study, hasClass.active);
                this.rotation.y = 0;
                this.horizontal = 0;
                await this.initValue();
                this.text = 'STUDY';
                this.font = {
                    wight: 900,
                    size: this.getFontSize(),
                    family: "'Gill Sans', sans-serif", //"'Red Hat Display', sans-serif", //"Arial", //"'Nippo', sans-serif",
                    threshold: this.isMobile ? 0.18 : 0.12,
                };
                this.color = {
                    front: '#00be08',
                    back: '#e0bdd7',
                };
                this.setBorderStyle('study');
                // テキスト画像をセット
                this.setTextImage();
                this.textImage.data = await this.getImageData();
                await this.getTitleInfo();
                this.isStudyArea = true;
                this.change();
            }
        }
        const current = scrollY - document.querySelector('.p-index-mv').clientHeight;
        const winSizeW = window.innerWidth;
        const winSizeH = window.innerHeight;
        if (isContains(this.elms.study, hasClass.active)) {
            if (scrollY > study * mvThreshold && !this.isMobile) {
                if (scrollY > this.scroll.y) {
                    this.horizontal = current > 0 ? winSizeW * -0.3 : -0;
                    this.vertical = current > winSizeH ? winSizeH * 0.3 : 0;
                } else if (scrollY < this.scroll.y) {
                    this.horizontal = current < winSizeH * 0.3 ? winSizeW * 0.3 : 0;
                    this.vertical = current < winSizeW ? winSizeH * -0.3 : 0;
                }
                this.object.current.x = this.three.object.position.x + this.horizontal;
                this.object.current.y = this.three.object.position.y + this.vertical;
            } else if (scrollY > study * mvThreshold && this.isMobile) {
                if (scrollY > this.scroll.y) {
                    this.horizontal = current > winSizeH / 3 ? -winSizeW : 0;
                } else if (scrollY < this.scroll.y) {
                    this.horizontal = current < winSizeH / 3 ? winSizeW : 0;
                }
                this.object.current.x = this.three.object.position.x + this.horizontal;
            }
            if (scrollY < study * mvThreshold) {
                removeClass(this.elms.study, hasClass.active);
                this.isStudyArea = false;
                this.three.object.position.x = 0;
                this.three.object.position.y = 0;
                this.horizontal = 0;
                await this.initValue();
                this.text = this.isMobile ? 'PORT¥nFOLIO' : 'THANKS!';
                this.font = {
                    wight: 900,
                    size: this.getFontSize(),
                    family: "'Gill Sans', sans-serif", //"'Red Hat Display', sans-serif", //"Arial", //"'Nippo', sans-serif",
                    threshold: this.isMobile ? 0.18 : 0.12,
                };
                this.color = {
                    front: '#906cd1',
                    back: '#f9b97c',
                };
                this.setBorderStyle('mv');
                // テキスト画像をセット
                this.setTextImage();
                this.textImage.data = await this.getImageData();
                await this.getTitleInfo();
                this.change();
            }
        }
        this.scroll.y = scrollY;
    }
    change(): void {
        const geometry = <BufferGeometry>this.three.points.geometry;
        const geometryPosition = geometry.attributes.position;
        for (const [attribute, list] of Object.entries(this.title.firstList)) {
            const size = attribute === 'alpha' || attribute === 'size' ? 1 : 3;
            this.setAttribute(attribute, list, size);
        }
        geometryPosition.needsUpdate = true;
        const geometryColor = geometry.attributes.color;
        geometryColor.needsUpdate = true;
    }
    handleMove(e: Partial<MouseEvent>): void {
        if (this.three.object) this.three.object.rotation.x = (e.clientY - window.innerHeight / 2) / window.innerHeight;
        if (this.textImage.canvas) {
            this.mouse.x = e.clientX - this.winSize.width * 0.5;
            this.mouse.y = -(e.clientY - this.winSize.height * 0.5);
        }
        if (this.three.points) {
            const geometryPosition = this.three.points.geometry.attributes.position;
            geometryPosition.needsUpdate = true;
        }
    }
    async initValue(): Promise<void> {
        await this.initCommonValue();
    }
}
