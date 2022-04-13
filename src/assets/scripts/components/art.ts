import Shape from './shape';
import Test from './webgl';
// import Webgl from './mv';

interface ArtOptions {
    canvas?: HTMLCanvasElement;
    ctx?: CanvasRenderingContext2D;
}

export default class Art {
    params: ArtOptions;
    // webgl: Webgl;
    test: Test;
    constructor(props: ArtOptions) {
        this.params = props;
        this.test = new Test();
        // this.webgl = new Webgl();
        window.addEventListener('load', () => {
            this.init();
        });
    }
    init(): void {
        // this.webgl.init();
        this.test.init(this.params.canvas);
        // eslint-disable-next-line no-new
        new Shape();
        // window.addEventListener('resize', this.resize.bind(this));
        // this.webgl.render();
    }
    // resize(): void {
    //     this.webgl.handleResize();
    // }
}
