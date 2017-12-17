#include stuff/gl/complex/shaders/ops.glsl;
#include stuff/gl/geometry/shaders/intersect.glsl;
#include stuff/gl/geometry/shaders/differential.glsl;
#include stuff/gl/camera/shaders/camera.glsl;

uniform vec3 bounds[2];
varying vec2 vUv;

/* Must use string replace here because the webpack glsl template loader will throw an error with just 
 *
 * $distanceProgram
 */
float distanceProgram;

//Include this here since the shader needs to have the sdf defined before calling.
#include stuff/gl/geometry/shaders/implicit_function.glsl;

void main() {
    gl_FragColor = vec4(-1.);

    vec4 rayPos = getCameraPos();
    vec4 rayDir = getCameraRay(vUv);

    float bbmin, bbmax;
    if(intersectAABB(bounds[0], bounds[1], rayPos.xyz, rayDir.xyz, bbmin, bbmax)) {
        float t;
        if(intersectImplicit(rayPos, rayDir, bbmin, bbmax, t)) {
            gl_FragColor = vec4(normalize(gradient(rayPos + t * rayDir, t)), t);
        }
    }
}
