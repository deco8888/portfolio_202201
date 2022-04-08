import Photo from './photos';

export default class Study {
    photo: Photo;
    constructor() {
        this.photo = new Photo();
        window.addEventListener('load', () => {
            this.init();
        });
    }
    init(): void {
        this.photo.init();
        window.addEventListener('resize', this.resize.bind(this));
        // this.webgl.render();
    }
    resize(): void {
        this.photo.handleResize();
    }
}
