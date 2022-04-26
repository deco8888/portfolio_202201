// どのくらいの精度でデータを扱うかと指定する文でprecision修飾子で宣言
precision mediump float;
uniform float uProgress;
uniform vec2 uScale;
uniform vec2 uPosition;
uniform vec2 uResolution;
// varying: シェーダ間でデータのやり取りができる変数

void main() {
    vec3 pos = position.xyz;

    float activation = uv.x;
    float latestStart = 0.5;
    float startAt = activation * latestStart;
    float vertexProgress = smoothstep(startAt, 1.0, uProgress);

    // メッシュのスケールを使用して、画面サイズにあわせた必要なスケールを計算する
    vec2 scaleToViewSize = uResolution / uScale - 1.0;
    vec2 scale = vec2(1.0 + scaleToViewSize * vertexProgress);
    pos.xy *= scale;

    // 頂点を中心に移動させる
    pos.y += -uPosition.y * vertexProgress;
    pos.x += -uPosition.x * vertexProgress;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
