precision mediump float;
attribute vec3 color;
attribute float alpha;
attribute float size;
attribute vec2 random;
attribute float rand;
uniform float uAspect;
uniform float uRatio;
uniform float uTime;
uniform float uMouse;
uniform bool uFirst;
varying vec2 vUv;
varying vec3 v_color;
varying float v_alpha;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

void main() {
    v_color = color;
    v_alpha = alpha;
    vec3 pos = position;

    if(uFirst) {
        // 方向
        // normalize(x)	xを正規化した値を返す
        // vec3 vertexDirection = vec3(position.x, position.y, position.z) + vec3(uTime);
        vec3 vertexDirection = vec3(normalize(position.xy), 0.0) + vec3(uTime);
        // // シームレスノイズ
        vec3 noise = position * snoise3(vec3(vertexDirection)) * 5.0 * uRatio;
        vec3 diffuse = vertexDirection * 100.0 * uRatio * rand;
        vec3 finalPosition = position + noise + diffuse;
        pos = finalPosition;
    }

    // 半径範囲
    // float radiusRange = 10.0;
    // float radiusRandomX = radiusRange * sin(uTime * random.x + random.y * 3.0);
    // float radiusRandomY = radiusRange * cos(uTime * random.x + random.y * 3.0);
    // float radiusRandomAll = radiusRandomX + radiusRandomY;
    // float finalRadius = 3.0 + radiusRandomAll;

    // float moveRange = 2.0;
    // float moveRandomX = moveRange * sin(uTime + random.x * random.y * 50.0);
    // float moveRandomY = moveRange * cos(uTime + random.x * random.y * 50.0);
    // vec3 finalPosition = position + vec3(moveRandomX, moveRandomY, 0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size; // finalRadius + 1.0;
}