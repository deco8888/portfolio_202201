// どのくらいの精度でデータを扱うかと指定する文でprecision修飾子で宣言
precision mediump float;
uniform vec2 uResolution;
uniform vec2 uShape;
uniform sampler2D uTex;
varying vec2 vUv;
// uniform sampler2D u_texture;

// vec4 _texture = texture2D(u_texture, vUv);
// gl_FragColor = _texture;

void main() {
    vec4 texcel = texture2D(uTex, gl_PointCoord);
    // gl_FragColor に vec4 型（rgba）の色を入れることでピクセル色を決定する。
    vec2 center = vec2(.03, .03);
    float lightness = 0.5 / length(vUv - center);
    vec4 color = vec4(vec3(lightness), 1.0);
    gl_FragColor = color * texcel;
}
