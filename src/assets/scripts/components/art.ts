import Shape from './shape';
// import Test from './webgl';
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
        // new Test();
        this.webgl = new Webgl();
        window.addEventListener('load', () => {
            this.init();
        });
    }
    init(): void {
        this.webgl.init();
        // this.webgl.init(this.params.canvas);
        // eslint-disable-next-line no-new
        new Shape();
        window.addEventListener('resize', this.resize.bind(this));
        // this.webgl.render();
    }
    resize(): void {
        this.webgl.handleResize();
    }
}
