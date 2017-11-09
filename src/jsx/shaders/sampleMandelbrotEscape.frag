//Compute escapes in bulk to test for escapes.
#include stuff/gl/complex/shaders/ops.glsl;

//Can't use uniforms for this, because glsl does loop unrolling.
#define MAX_ITER $MAX_ITER.
precision highp float;

//Coordinate samples to compute Buddhabrot for our Monte Carlo process.
uniform sampler2D samples;
varying vec2 vUv;

void main() {
    vec4 s = texture2D(samples, vUv);
    vec2 c = s.xy;
    vec2 z = vec2(0.);

    for(float i = 0.; i <= MAX_ITER; ++i) {
        z = cmul(z, z) + c;

        if(cabs2(z) >= 4.) {
            gl_FragColor = vec4(1., i, 0., 0.);
            return;
        }
    }
    gl_FragColor = vec4(0.);
}
