import * as THREE from 'three';

interface ThreeNumber {
    [key: string]: number;
}

export default class Webgl {
    three: {
        camera: THREE.PerspectiveCamera | null;
        scene: THREE.Scene;
        mesh: THREE.Mesh | THREE.Mesh[] | null;
        renderer: THREE.WebGLRenderer | null;
    };
    winSize: ThreeNumber;
    viewport!: ThreeNumber;
    constructor() {
        this.three = {
            camera: null,
            scene: new THREE.Scene(),
            mesh: null,
            renderer: null,
        };
        this.winSize = {
            width: 0,
            height: 0,
        };
    }
    initCamera(): THREE.PerspectiveCamera {
        const camera = new THREE.PerspectiveCamera(
            45, // 画角
            this.winSize.width / this.winSize.height, // 縦横比
            0.1, // 視点から最も近い面までの距離
            2000 // 視点から最も遠い面までの距離
        );
        camera.position.set(0, 0, 1000);
        // どの位置からでも指定した座標に強制的に向かせることができる命令
        camera.lookAt(this.three.scene.position);
        return camera;
    }
    initRenderer(): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true, // 物体の輪郭を滑らかにする
        });
        /**
         * デスクトップでは、メインディスプレイ・サブディスプレイでPixelRatioの異なる可能性がある。
         * ➡ リサイズイベントでsetPixelRatioメソッドでを使って更新
         * https://ics.media/tutorial-three/renderer_resize/
         */
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0xeaf2f5, 0);
        renderer.setSize(this.winSize.width, this.winSize.height);
        return renderer;
    }
    initViewport(): ThreeNumber {
        if (this.three.camera) {
            // fov : Field OF View (カメラの位置から見えるシーンの範囲)
            // 角度をラジアンに変更
            const fov = this.three.camera.fov * (Math.PI / 180);
            // https://kou.benesse.co.jp/nigate/math/a14m0313.html
            // https://qiita.com/watabo_shi/items/0811d03390c18e46be86
            // tanΘ(高さの半分 / 奥行) * 奥行 * 2
            const height = Math.tan(fov / 2) * this.three.camera.position.z * 2;
            const width = height * this.three.camera.aspect;
            this.viewport = {
                width,
                height,
            };
        }
        return this.viewport;
    }
    setSize(): void {
        this.winSize = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
    }
}
