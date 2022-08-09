// どのくらいの精度でデータを扱うかと指定する文でprecision修飾子で宣言
precision mediump float;
varying vec3 v_color;
varying float v_alpha;

void main() {
    // gl_PointCoord: 描画される点上のテクスチャ座標
    vec2 temp = gl_PointCoord - vec2(0.5);
    // dot: ドット積・点乗積➡ベクトル演算の一種で、2つの同じ長さの数列から1つの数値を返す演算
    float f = dot(temp, temp);
    if(f > 0.25) {
      // 何も出力しない
      discard;
    }
    gl_FragColor = vec4(v_color, v_alpha);
}
