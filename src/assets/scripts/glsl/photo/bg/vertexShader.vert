// どのくらいの精度でデータを扱うかと指定する文でprecision修飾子で宣言
precision mediump float;
uniform float uProgress;
uniform float uSpeed;
uniform float uWave;
uniform float uTime;
uniform bool uIsMobile;
// varying: シェーダ間でデータのやり取りができる変数
varying vec2 vUv;
varying float vNoise;
varying float vProgress;
varying float vTime;

float PI = 3.1415926535897932384626433832795;

void main() {
    vec3 pos = position;

    float noise = 0.1 * cos((1.0 - pos.x) * uWave + uSpeed) * uProgress;
    // pos.z += noise * 0.5;

    // 横の動き（周波数）
    float freq = 0.00015 * uTime; // 振動数（の役割） 大きくすると波が細かくなる

    if(uIsMobile) {
        pos.y = pos.y + (cos(pos.x * PI) * freq);
    } else {
        pos.x = pos.x + (cos(pos.y * PI) * freq);
    }

    vUv = uv;
    vNoise = noise;
    vProgress = uProgress;
    vTime = uTime;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
