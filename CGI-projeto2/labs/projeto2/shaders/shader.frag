precision highp float;

varying vec3 fNormal;
uniform vec3 color;

void main() {
    gl_FragColor = vec4(color+fNormal/30.0, 1.0);
}
