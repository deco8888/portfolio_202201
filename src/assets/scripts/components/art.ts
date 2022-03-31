import Shape from './shape';
// import Webgl from './webgl';
import Webgl from './mv';

interface ArtOptions {
    canvas?: HTMLCanvasElement;
    ctx?: CanvasRenderingContext2D;
}

export default class Art {
    params: ArtOptions;
    webgl: Webgl;
    constructor(props: ArtOptions) {
        this.params = props;
        this.webgl = new Webgl();
        window.addEventListener('load', () => {
            this.init();
        })
    }
    init(): void {
        // this.webgl.init(this.params.canvas, this.params.ctx);
        this.webgl.init();
        // eslint-disable-next-line no-new
        new Shape();
        window.addEventListener('resize', this.resize.bind(this));
        // this.webgl.render();
    }
    resize(): void {
        this.webgl.handleResize();
    }
}
