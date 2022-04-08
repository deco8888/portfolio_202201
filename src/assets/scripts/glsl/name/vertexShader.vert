precision mediump float;
attribute vec3 position;
attribute vec3 color;
attribute float alpha;
attribute vec2 random;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uAspect;
uniform float uRatio;
uniform float uTime;
uniform float uMouse;
varying vec2 vUv;
varying vec3 v_color;
varying float v_alpha;

void main() {
    v_color = color;
    v_alpha = alpha;

    // 半径範囲
    float radiusRange = 10.0;
    float radiusRandomX = radiusRange * sin(uTime * random.x + random.y * 3.0);
    float radiusRandomY = radiusRange * cos(uTime * random.x + random.y * 3.0);
    float radiusRandomAll = radiusRandomX + radiusRandomY;
    float finalRadius = 3.0 + radiusRandomAll;

    float moveRange = 2.0;
    float moveRandomX = moveRange * sin(uTime + random.x * random.y * 50.0);
    float moveRandomY = moveRange * cos(uTime + random.x * random.y * 50.0);
    vec3 finalPosition = position + vec3(moveRandomX, moveRandomY, 0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);
    gl_PointSize = finalRadius + 1.0;
}