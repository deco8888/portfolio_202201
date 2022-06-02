// どのくらいの精度でデータを扱うかと指定する文でprecision修飾子で宣言
precision mediump float;
uniform vec2 uResolution;
uniform vec2 uImageResolution;
uniform sampler2D uTexture;
uniform float uMoz;
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
    // UV座標: テクスチャ上の座標（1. 0~1の値で正規化 / 2. 左下が原点）
    vec2 uv = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    float moz = uMoz;

    if(moz > 0.0) {
       uv = floor(uv / moz) * moz + (moz * 0.5);
    }

    vec2 offset = vec2(vTime * 0.0003, 0.0);
    vec3 color = texture2D(uTexture, uv).rgb;
    color.g = texture2D(uTexture, uv + offset + vProgress * vNoise * 0.1).g;
    color.b = texture2D(uTexture, uv + offset + vProgress * vNoise * 0.2).b;

    gl_FragColor = vec4(color, 0.8);
}
