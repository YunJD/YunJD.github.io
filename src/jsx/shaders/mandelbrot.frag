/* Pre-calculate a Mandelbrot set which will be used to help with random
 * sampling. This will make it possible to discard low-iteration escapes and
 * values that don't escape, giving higher chances of sampling interesting
 * locations.
 */

#include stuff/gl/complex/shaders/ops.glsl;

//Can't use uniforms for this, because glsl does loop unrolling.
#define MAX_ITER $MAX_ITER.
precision highp float;

uniform vec2 translate;
uniform float scale;
uniform float aspect;
varying vec2 vUv;

vec2 coord() {
    return (vUv * 2. - 1.) * vec2(aspect, 1.) * scale + translate;
}

void main() {
    vec2 c = coord();
    vec2 z = vec2(0.);

    for(float i = 0.; i <= MAX_ITER; ++i) {
        if(cabs2(z) >= 4.)
        {
            //gl_FragColor = vec4(cos(vec3(float(i)) * 0.07 + vec3(.15, .8, 2.1)) * 0.5 + 0.5, i);
            gl_FragColor = vec4(c, i, 1.);
            return;
        }
        z = cmul(z, z) + c;
    }
    gl_FragColor = vec4(c, MAX_ITER + 1., 0.);
}
