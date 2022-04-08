export class Vec3 {
    x: number;
    y: number;
    z: number;
    fov: number;
    viewDistance: number;
    static fov: number;
    static viewDistance: number;
    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.fov = 2000;
        this.viewDistance = 200;
    }
    public static fromScreenCoords(canvas: HTMLCanvasElement, _x: number, _y: number, _z: number) {
        const factor = 2000 / 200;
        const x = (_x - canvas.width / 2) / factor;
        const y = (_y - canvas.height / 2) / factor;
        const z = _z !== undefined ? _z : 0;
        return new Vec3(x, y, z);
    }
    public rotateX(angle: number) {
        const z = this.z * Math.cos(angle) - this.x * Math.sin(angle);
        const x = this.z * Math.sin(angle) + this.x * Math.cos(angle);
        return new Vec3(x, this.y, z);
    }
    public rotateY(angle: number) {
        const y = this.y * Math.cos(angle) - this.z * Math.sin(angle);
        const z = this.y * Math.sin(angle) + this.z * Math.cos(angle);
        return new Vec3(this.x, y, z);
    }
    public pp(canvas: HTMLCanvasElement) {
        const factor = this.fov / (this.viewDistance + this.z);
        const x = this.x * factor + canvas.width / 2;
        const y = this.y * factor + canvas.height / 2;
        return new Vec3(x, y, this.z);
    }
    public static resetValue(): Vec3 {
        this.fov = 2000;
        this.viewDistance = 200;
        return new Vec3(0, 0, 0);
    }
}
