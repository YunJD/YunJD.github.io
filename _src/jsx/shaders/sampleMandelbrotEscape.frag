//Compute escapes in bulk to test for escapes.
#include stuff/gl/complex/shaders/ops.glsl;

//Can't use uniforms for this, because glsl does loop unrolling.
#define MAX_CHUNK $MAX_CHUNK.
#define BAILOUT2 $BAILOUT2.
precision highp float;

uniform int usePrev;
uniform sampler2D prev;
//Coordinate samples to compute Buddhabrot for our Monte Carlo process.
uniform sampler2D samples;
varying vec2 vUv;

void main() {
    vec4 zPrev = usePrev == 1 ? texture2D(prev, vUv) : vec4(0.);
    if(zPrev.r != 0.) {
        gl_FragColor = zPrev;
        return;
    }
    vec4 s = texture2D(samples, vUv);
    vec2 c = s.xy;
    vec2 z = zPrev.ba;

    for(float i = 0.; i <= MAX_CHUNK; ++i) {
        z = cmul(z, z) + c;

        if(cabs2(z) >= BAILOUT2) {
            gl_FragColor = vec4(1., zPrev.g + i, z);
            return;
        }
    }
    gl_FragColor = vec4(0., zPrev.g + MAX_CHUNK, z);
}
