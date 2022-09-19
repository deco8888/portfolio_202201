import { lerp } from 'three/src/math/MathUtils';
import { isMobile } from '~/assets/scripts/modules/isMobile';

interface ParticleOption {
    first: {
        x: number;
        y: number;
    };
    second: {
        x: number;
        y: number;
    };
    current: {
        x: number;
        y: number;
    };
    radius: number;
    directionX: number;
    directionY: number;
    index: number;
}

export default class Particles {
    index: number;
    canvas: {
        el: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        width: number;
        height: number;
    };
    mouse: {
        [key: string]: number;
    };
    isMobile: boolean;
    radius: number;
    total: number;
    particles: ParticleOption[];
    diff: number;
    animFrame: number;
    isStart: boolean;
    constructor(canvas: HTMLCanvasElement, index: number) {
        this.index = index;
        this.canvas = {
            el: canvas,
            ctx: canvas.getContext('2d'),
            width: window.innerWidth,
            height: window.innerHeight,
        };
        this.mouse = {
            x: 0,
            y: 0,
            radius: 100,
        };
        this.isMobile = isMobile();
        this.radius = this.isMobile ? 40 : 70;
        this.total = this.isMobile ? 30 : 40;
        this.particles = [];
        this.diff = this.isMobile ? 10 : 10;
        this.isStart = true;
        this.prepare();
    }
    prepare(): void {
        this.init();
        for (let i = 0; i < this.particles.length; i++) {
            this.create(this.particles[i]);
        }
        this.render();
    }
    init(): void {
        // this.canvas.el = document.querySelector("[data-mv-line='canvas']");
        // this.canvas.ctx = this.canvas.el.getContext('2d');
        this.canvas.el.width = window.innerWidth;
        this.canvas.el.height = window.innerHeight / 2;
        const canvasPos = this.canvas.el.getAttribute('data-mv-line-pos');
        const firstX = this.canvas.el.width / 2;
        const firstY = canvasPos === 'top' ? this.canvas.el.height : 0;
        this.handleEvent();
        for (let i = 0; i < this.total; i++) {
            const radius = Math.floor(Math.random() * this.radius);
            let secondX = Math.random() * this.canvas.el.clientWidth;
            secondX = Math.max(secondX, radius * 2 + this.diff);
            secondX = Math.min(secondX, this.canvas.el.width - radius * 2 - this.diff * 2);
            let secondY = Math.floor(Math.random() * this.canvas.el.clientHeight);
            secondY = Math.max(secondY, radius + this.diff);
            secondY = Math.min(secondY, this.canvas.el.clientHeight - radius);
            const directionX = Math.random() * 2;
            const directionY = Math.random() * 2 - 1;
            const particle = {
                first: {
                    x: firstX,
                    y: firstY,
                },
                second: {
                    x: secondX,
                    y: secondY,
                },
                current: {
                    x: firstX,
                    y: firstY,
                },
                radius,
                directionX,
                directionY,
                index: i,
            };
            this.particles.push(particle);
        }
    }
    render(): void {
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            if (!this.isStart) {
                this.update(particle);
            } else {
                this.start(particle);
            }
        }
        this.animFrame = requestAnimationFrame(this.render.bind(this));
    }
    start(particle: ParticleOption): void {
        this.create(particle);
        particle.current.x = lerp(particle.current.x, particle.second.x, 0.08);
        particle.current.y = lerp(particle.current.y, particle.second.y, 0.08);
        if (Math.round(particle.current.y) === Math.round(particle.second.y)) {
            this.isStart = false;
        }
    }
    handleEvent(): void {
        window.addEventListener('mousemove', (event) => {
            this.mouse.x = event.x;
            this.mouse.y = this.index > 0 ? event.y - this.canvas.el.clientHeight : event.y;
        });
    }
    setColor(index: number): void {
        const ctx = this.canvas.ctx;
        if (index % 4 === 0 || index % 4 === 2) {
            ctx.strokeStyle = '#ffffff';
            ctx.globalAlpha = 1;
            ctx.lineWidth = 1;
            ctx.stroke();
        } else if (index % 4 === 1) {
            ctx.fillStyle = '#f0dcd0';
            ctx.globalAlpha = 0.4;
            ctx.fill();
        } else {
            ctx.fillStyle = '#d3cbed';
            ctx.globalAlpha = 0.3;
            ctx.fill();
        }
    }
    update(particle: ParticleOption): void {
        if (this.detectCollision(particle)) {
            // const min = particle.radius * 2 + this.diff;
            if (particle.second.x > this.mouse.x) {
                particle.second.x = lerp(particle.second.x, particle.second.x + particle.radius, 0.03);
                if (particle.directionX < 0) particle.directionX = -particle.directionX;
            }
            if (particle.second.x < this.mouse.x) {
                particle.second.x = lerp(particle.second.x, particle.second.x - particle.radius, 0.03);
                if (particle.directionX > 0) particle.directionX = -particle.directionX;
            }
            if (particle.second.y > this.mouse.y) {
                particle.second.y = lerp(particle.second.y, particle.second.y + particle.radius, 0.03);
                if (particle.directionY < 0) particle.directionY = -particle.directionY;
            }
            if (particle.second.y < this.mouse.y) {
                particle.second.y = lerp(particle.second.y, particle.second.y - particle.radius, 0.03);
                if (particle.directionY > 0) particle.directionY = -particle.directionY;
            }
        }
        particle.second.x += particle.directionX;
        particle.second.y += particle.directionY;
        const canvasW = this.canvas.el.width;
        const canvasH = this.canvas.el.height;
        const maxX = canvasW - particle.radius - this.diff * 2;
        const maxY = canvasH - particle.radius;
        const min = particle.radius + this.diff;
        if (
            (particle.second.x >= maxX && particle.second.x < canvasW) ||
            (particle.second.x <= min && particle.second.x > 0)
        ) {
            particle.directionX = -particle.directionX;
        }
        if (particle.second.x >= maxX && particle.second.x >= canvasW) {
            particle.second.x = maxX;
        }
        if (particle.second.x <= min && particle.second.x <= 0) {
            particle.second.x = min * 2;
        }
        if (
            (particle.second.y >= maxY && particle.second.y < canvasH) ||
            (particle.second.y <= min && particle.second.y > 0)
        ) {
            particle.directionY = -particle.directionY;
        }
        if (particle.second.y >= maxY && particle.second.y >= canvasH) {
            particle.second.y = maxY - this.diff * 2;
        }
        if (particle.second.y <= min && particle.second.y <= 0) {
            particle.second.y = min * 2;
        }
        particle.current.x = particle.second.x;
        particle.current.y = particle.second.y;
        this.create(particle);
    }
    judgeX(particle: ParticleOption): boolean {
        return (
            particle.second.x > this.canvas.el.width - particle.radius - this.diff * 2 ||
            particle.second.x < particle.radius + this.diff
        );
    }
    // パーティクルが衝突しているかどうか
    detectCollision(particle: ParticleOption): boolean {
        const dx = this.mouse.x - particle.second.x;
        const dy = this.mouse.y - particle.second.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.mouse.radius + particle.radius;
    }
    create(particle: ParticleOption): void {
        this.setColor(particle.index);
        // パーティクルの描画
        const ctx = this.canvas.ctx;
        ctx.beginPath();
        // void ctx.arc(x座標, y座標, 半径, startAngle, endAngle [, counterclockwise]);
        // ※「counterclockwise」
        ctx.arc(particle.current.x, particle.current.y, particle.radius, 0, Math.PI * 2, true);

        // ctx.rect(particle.second.x, particle.second.y, particle.radius, particle.radius);
    }
    handleResize(): void {
        this.cancel();
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.el.width = window.innerWidth;
        this.canvas.el.height = window.innerHeight / 2;
        this.isMobile = isMobile();
        this.radius = this.isMobile ? 40 : 60;
        this.total = this.isMobile ? 30 : 40;
        this.particles = [];
        this.diff = this.isMobile ? 10 : 10;
        this.isStart = true;
        this.prepare();
    }
    cancel(): void {
        cancelAnimationFrame(this.animFrame);
        this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
