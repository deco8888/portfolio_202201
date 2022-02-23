precision mediump float;
attribute vec3 position;
attribute vec3 color;
attribute float alpha;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec3 v_color;
varying float v_alpha;

void main() {
    v_color = color;
    v_alpha = alpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 3.0;
}