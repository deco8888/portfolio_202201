// どのくらいの精度でデータを扱うかと指定する文でprecision修飾子で宣言
precision mediump float;
uniform float uProgress;
uniform vec3 uColor;

void main() {
    vec3 color = uColor;
    gl_FragColor = vec4(color, 1.0);
}