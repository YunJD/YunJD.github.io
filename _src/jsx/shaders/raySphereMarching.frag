#include stuff/gl/complex/shaders/ops.glsl;
#include stuff/gl/geometry/shaders/intersect.glsl;
#include stuff/gl/geometry/shaders/differential.glsl;
#include stuff/gl/camera/shaders/camera.glsl;

uniform float far;
uniform float threshold;
varying vec2 vUv;
uniform vec3 bounds[2];

/* Must use string replace here because the webpack glsl template loader will throw an error with just 
 *
 * $distanceProgram
 */
float distanceProgram;

void main() {
    gl_FragColor = vec4(-1.);

    vec4 rayPos = getCameraPos();
    vec4 rayDir = getCameraRay(vUv);

    //getCameraRay(vUv, rayPos, rayDir);

    float bbmin, bbmax;
    if(!intersectAABB(bounds[0], bounds[1], rayPos.xyz, rayDir.xyz, bbmin, bbmax)) {
        return;
    }

    bbmin = max(0., bbmin);
    bbmax = min(bbmax, far);

    float t = bbmin;

    float dist = distance(rayPos + t * rayDir, t, 0);

    //Inside/outside
    float fSign = dist < 0. ? -1. : 1.;
    for(int i = 1; i <= 2500; ++i) {
        if(abs(dist) <= threshold) {
            if(t >= bbmin - threshold && t <= bbmax + threshold) {
                gl_FragColor = vec4(normalize(gradient(rayPos + t * rayDir, t, i)), t);
            }
            return;
        }

        t += fSign * dist;
        if(t > bbmax * 2.) {
            return;
        }
        dist = distance(rayPos + t * rayDir, t, i);
    }
}
