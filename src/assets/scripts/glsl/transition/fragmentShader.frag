// どのくらいの精度でデータを扱うかと指定する文でprecision修飾子で宣言
precision mediump float;
uniform vec3 uColor;
uniform float uDirection;
uniform float uProgress;
uniform float uRatio;
uniform float uCurl;
uniform bool uThreshold;
uniform vec2 uResolution;
uniform vec2 uImageResolution;
// varying: シェーダ間でデータのやり取りができる変数
varying vec2 vUv;
float PI = 3.1415926535897932384626433832795;

void main() {
    vec2 uv = vUv;
    // 正弦波(sin(x)) 周期を引数-1.0～1.0の範囲で収めるためにはPIを掛ける必要がある
    uv.y -=((sin(uv.x * PI) * uCurl) * uRatio);
    float dir = uDirection * 2.0 - 1.0;
    if(!uThreshold) uv.y = uDirection - (uv.y * dir);
    // fwidth: abs(dFdx(p)) + abs(dFdy(p))を返す関数
    float step = smoothstep(uv.y - (fwidth(uv.y) * dir), uv.y, uProgress);
    vec4 color = mix(vec4(uColor, 0.0), vec4(uColor, 1.0), step);
    gl_FragColor = color;
}
