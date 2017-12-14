#include stuff/gl/complex/shaders/ops.glsl;
#include stuff/gl/geometry/shaders/intersect.glsl;
#include stuff/gl/geometry/shaders/differential.glsl;

uniform float far;
uniform float threshold;
uniform mat4 invProjMat;
uniform mat4 mat;
varying vec2 vUv;
precision highp float;
uniform vec3 bounds[2];

/* Must use string replace here because the webpack glsl template loader will throw an error with just 
 *
 * $distanceProgram
 */
float distanceProgram;

void main() {
    gl_FragColor = vec4(-1.);

    //At this point, all that the projection matrix does is map extents to aspect * tan(fov / 2) and set z to -1.
    vec4 rayPos = mat * vec4(0., 0., 0., 1.);
    vec4 rayDir = invProjMat * vec4(2. * (vUv - 0.5), 0., 1.);
    float bbmin, bbmax;

    //Vectorize
    rayDir.a = 0.;
    rayDir = mat * normalize(rayDir);

    if(!intersectAABB(bounds[0], bounds[1], rayPos.xyz, rayDir.xyz, bbmin, bbmax)) {
        return;
    }

    bbmin = max(0., bbmin);
    bbmax = min(bbmax, far);

    float t = bbmin;

    float dist = distance(rayPos + t * rayDir, rayPos, rayDir, 0);

    //Inside/outside
    float fSign = dist < 0. ? -1. : 1.;
    for(int i = 1; i <= 500; ++i) {
        if(abs(dist) <= threshold) {
            if(t >= bbmin - threshold && t <= bbmax + threshold) {
                gl_FragColor = vec4((rayPos + t * rayDir).xyz, float(i));
            }
            return;
        }

        t += fSign * dist;
        if(t > bbmax * 2.) {
            return;
        }
        dist = distance(rayPos + t * rayDir, rayPos, rayDir, i);
    }
}
