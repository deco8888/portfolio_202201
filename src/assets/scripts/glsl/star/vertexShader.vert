precision mediump float;
varying vec2 vUv;
attribute float size;
// attribute vec3 position;
/**
* modelMatrix：オブジェクト座標からワールド座標へ変換する
* viewMatrix：ワールド座標から視点座標へ変換
* modelViewMatrix：modelMatrixとviewMatrixの積算
* projectionMatrix：カメラの各種パラメータから３次元を２次元に射影し、クリップ座標系に変換する行列
*/
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
// varying vec2 vUv;

void main() {
    vUv = uv;
    // projectionMatrix:
    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    
    // position: ShaderMaterialで補完されるvec3型(x,y,z)の変数。ジオメトリの頂点。
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size;
}