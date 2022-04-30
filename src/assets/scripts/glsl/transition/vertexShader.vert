// どのくらいの精度でデータを扱うかと指定する文でprecision修飾子で宣言
precision mediump float;
uniform vec2 uScale;
uniform vec2 uPosition;
uniform vec2 uResolution;
// varying: シェーダ間でデータのやり取りができる変数
varying vec2 vUv;

void main() {
    vec3 pos = position.xyz;

    // ■smoothstep(min, max, between)
    // ➡︎ エルミート補間(補間が開始時から徐々に加速し、終わりに近づくにつれて減速)
    // この関数はある範囲の間で0.0から1.0まで滑らかに変化する数値を返す
    // ・入力値がminより小さい場合、smoothstep()は0を返す
    // ・入力値がmaxと等しいか、maxより大きい場合、smoothstep()は1を返す
    // ・入力がminとmaxの間にある場合、smoothstep()は0と1.0の間の値を（比例して）返す
    // ・最初の2つのパラメータ(min, max)は値の変化の起こる範囲の始まりと終わり
    // ・3つめのパラメータ(between)はチェックの対象になる値
    // ・0.02よりもabs(position.y - position.x)が小さければ0を返す
    // ・abs(position.y - position.x)が 0か、0よりも大きい場合、1を返す
    // ・abs(position.y - position.x)が 0.02 ~ 0 の間にある場合、0と1.0の間の値を（比例して）返す
    float progress = smoothstep(uv.x, 1.0, 1.0);
    vec2 size = uResolution / uScale - 1.0;
    vec2 progressPos = vec2(1.0 + size * progress);
    pos.xy *= progressPos;
    pos.x += uPosition.x * progress * -1.0;
    pos.y += uPosition.y * progress * -1.0;

    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
