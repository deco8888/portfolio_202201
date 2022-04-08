// どのくらいの精度でデータを扱うかと指定する文でprecision修飾子で宣言
precision mediump float;
uniform vec2 uResolution;
uniform vec2 uImageResolution;
uniform vec3 uColor;
// varying: シェーダ間でデータのやり取りができる変数
varying vec2 vUv;
varying float vNoise;
varying float vProgress;
varying float vTime;

void main() {
    vec2 ratio = vec2(
        min((uResolution.x / uResolution.y) / (uImageResolution.x / uImageResolution.y), 1.0),
        min((uResolution.y / uResolution.x) / (uImageResolution.y / uImageResolution.x), 1.0)
    );
    // UV座標: テクスチャ上の座標（1. ０〜１の値で正規化 / 2. 左下が原点）
    vec2 uv = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    gl_FragColor = vec4(uColor, 0.5);
}
