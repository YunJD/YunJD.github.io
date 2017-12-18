import ops from 'stuff/gl/complex/shaders/ops.jsx';
export default ({MAX_ITER, BAILOUT2}) => `
precision highp float;
precision highp int;
/* Pre-calculate a Mandelbrot set which will be used to help with random
 * sampling. This will make it possible to discard low-iteration escapes and
 * values that don't escape, giving higher chances of sampling interesting
 * locations.
 */

${ops()}

//Can't use uniforms for this, because glsl does loop unrolling.
#define MAX_ITER ${MAX_ITER}.
#define BAILOUT2 ${BAILOUT2}.
precision highp float;

uniform int usePrev;
uniform sampler2D prev;
uniform vec2 translate;
uniform float scale;
uniform float aspect;
varying vec2 vUv;

vec2 coord() {
    return (vUv * 2. - 1.) * vec2(aspect, 1.) * scale + translate;
}

void main() {
    vec4 zPrev = usePrev == 1 ? texture2D(prev, vUv) : vec4(0.);
    if(zPrev.a != 0.) {
        gl_FragColor = zPrev;
        return;
    }
    vec2 c = coord();
    vec2 z = zPrev.xy;

    for(float i = 0.; i <= MAX_ITER; ++i) {
        if(cabs2(z) >= BAILOUT2)
        {
            //gl_FragColor = vec4(cos(vec3(float(i)) * 0.07 + vec3(.15, .8, 2.1)) * 0.5 + 0.5, i);
            gl_FragColor = vec4(c, zPrev.b + i, 1.);
            return;
        }
        z = cmul(z, z) + c;
    }
    gl_FragColor = vec4(z, zPrev.b + MAX_ITER, 0.);
}
`
