import ops from 'stuff/gl/complex/shaders/ops.jsx';
export default ({MAX_ITER, BAILOUT}) => `
precision highp float;
precision highp int;
//Compute a single step to get values.

${ops()}

//Can't use uniforms for this, because glsl does loop unrolling.
#define MAX_ITER ${MAX_ITER}.
#define BAILOUT2 ${BAILOUT2}.
precision highp float;

uniform int clear;

//Coordinate samples to compute Buddhabrot for our Monte Carlo process.
uniform sampler2D samples;

//Previous z coordinates, and wether or not we escaped.
uniform sampler2D prev;

varying vec2 vUv;

void main() {
    if(clear == 1) {
        gl_FragColor = vec4(0.);
        return;
    }

    vec4 s = texture2D(samples, vUv);
    if(s.z == -1.) {
        return;
    }

    vec4 p = texture2D(prev, vUv);
    vec2 c = s.xy;
    vec2 z = p.xy;
    if(p.a == 1. || p.b > MAX_ITER || cabs2(z) >= BAILOUT2) {
        gl_FragColor = vec4(p.xyz, 1.);
        return;
    }
    gl_FragColor = vec4(cmul(z, z) + c, p.b + 1., 0.);
}
`;
