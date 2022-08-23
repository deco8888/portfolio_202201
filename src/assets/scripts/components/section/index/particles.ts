import { lerp } from 'three/src/math/MathUtils';
import { isMobile } from '../../isMobile';

interface ParticleOption {
    x: number;
    y: number;
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
    total: number;
    particles: ParticleOption[];
    diff: number;
    animFrame: number;
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
        this.total = 30;
        this.particles = [];
        this.diff = isMobile ? 10 : 10;
        this.init();
        this.render();
    }
    init(): void {
        // this.canvas.el = document.querySelector("[data-mv-line='canvas']");
        // this.canvas.ctx = this.canvas.el.getContext('2d');
        this.canvas.el.width = window.innerWidth;
        this.canvas.el.height = window.innerHeight / 2;
        this.handleEvent();
        for (let i = 0; i < this.total; i++) {
            const radius = Math.floor(Math.random() * 60);
            let x = Math.random() * this.canvas.el.clientWidth;
            x = Math.max(x, radius + this.diff);
            x = Math.min(x, this.canvas.el.width - radius - this.diff * 2);
            let y = Math.floor(Math.random() * this.canvas.el.clientHeight);
            y = Math.max(y, radius + this.diff);
            y = Math.min(y, this.canvas.el.clientHeight - radius);
            const directionX = Math.random() * 2;
            const directionY = Math.random() * 2 - 1;
            const particle = {
                x,
                y: y,
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
            this.update(this.particles[i]);
        }
        this.animFrame = requestAnimationFrame(this.render.bind(this));
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
            if (particle.x > this.mouse.x) {
                particle.x = lerp(particle.x, particle.x + particle.radius, 0.05);
                if (particle.directionX < 0) particle.directionX = -particle.directionX;
            }
            if (particle.x < this.mouse.x) {
                particle.x = lerp(particle.x, particle.x - particle.radius, 0.05);
                if (particle.directionX > 0) particle.directionX = -particle.directionX;
            }
            if (particle.y > this.mouse.y) {
                particle.y = lerp(particle.y, particle.y + particle.radius, 0.05);
                if (particle.directionY < 0) particle.directionY = -particle.directionY;
            }
            if (particle.y < this.mouse.y) {
                particle.y = lerp(particle.y, particle.y - particle.radius, 0.05);
                if (particle.directionY > 0) particle.directionY = -particle.directionY;
            }
        }
        particle.x += particle.directionX;
        particle.y += particle.directionY;
        const canvasW = this.canvas.el.width;
        const canvasH = this.canvas.el.height;
        const maxX = canvasW - particle.radius - this.diff * 2;
        const maxY = canvasH - particle.radius;
        const min = particle.radius + this.diff;
        if ((particle.x >= maxX && particle.x < canvasW) || (particle.x <= min && particle.x > 0)) {
            particle.directionX = -particle.directionX;
        }
        if (particle.x >= maxX && particle.x >= canvasW) {
            particle.x = maxX;
        }
        if (particle.x <= min && particle.x <= 0) {
            particle.x = min * 2;
        }
        if ((particle.y >= maxY && particle.y < canvasH) || (particle.y <= min && particle.y > 0)) {
            particle.directionY = -particle.directionY;
        }
        if (particle.y >= maxY && particle.y >= canvasH) {
            particle.y = maxY - this.diff * 2;
        }
        if (particle.y <= min && particle.y <= 0) {
            particle.y = min * 2;
        }
        this.create(particle);
    }
    judgeX(particle: ParticleOption): boolean {
        return (
            particle.x > this.canvas.el.width - particle.radius - this.diff * 2 ||
            particle.x < particle.radius + this.diff
        );
    }
    // パーティクルが衝突しているかどうか
    detectCollision(particle: ParticleOption): boolean {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
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
        // console.log(particle.x, particle.y);
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2, true);

        // ctx.rect(particle.x, particle.y, particle.radius, particle.radius);
    }
    handleResize(): void {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.canvas.el.width = window.innerWidth;
        this.canvas.el.height = window.innerHeight / 2;
    }
    cancel(): void {
        cancelAnimationFrame(this.animFrame);
    }
}
