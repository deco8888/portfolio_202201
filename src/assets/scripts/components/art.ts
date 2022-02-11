import Shape from './shape';
import Webgl from './webgl';

interface ArtOptions {
    canvas: HTMLCanvasElement;
}

export default class Art {
    params: ArtOptions;
    webgl: Webgl;
    constructor(props: ArtOptions) {
        this.params = props;
        this.webgl = new Webgl();
        this.init();
    }
    init(): void {
        this.webgl.init(this.params.canvas);
        // eslint-disable-next-line no-new
        new Shape();
        window.addEventListener('resize', this.resize.bind(this));
        this.webgl.render();
    }
    resize(): void {
        this.webgl.handleResize();
    }
}
