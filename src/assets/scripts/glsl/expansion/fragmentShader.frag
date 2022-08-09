// どのくらいの精度でデータを扱うかと指定する文でprecision修飾子で宣言
precision mediump float;
uniform float uProgress;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uColor1R;
uniform float uColor1G;
uniform float uColor1B;
uniform float uColor2R;
uniform float uColor2G;
uniform float uColor2B;
varying vec2 vUv;

void main() {
    // float strength = vUv.x;
    vec3 color1 = uColor1;
    vec3 color2 = uColor2;
    /**
    * step(a, x): aはしきい値、xはチェックされる値。しきい値未満の場合は0.0を、それ以上の場合は1.0の二値化を行う関数
    * mod: x-y*floor(x/y)を返す
    */
    // float strength = step(0.8, mod(vUv.x * 10.0, 1.0));
    // strength *= step(0.8, mod(vUv.y * 10.0, 1.0));
    // float progress = uProgress;
    // x(1-a)+y*aを返す（つまり線形補間）
    vec3 color = mix(vec3(uColor1R, uColor1G, uColor1B), vec3(uColor2R, uColor2G, uColor2B), vUv.y);
    gl_FragColor = vec4(color, 1.0);
}
