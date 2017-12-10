uniform float far;
uniform float threshold;
uniform mat4 invProjMat;
uniform mat4 mat;
varying vec2 vUv;
precision highp float;

/* Must use string replace here because the webpack glsl template loader will throw an error with just 
 *
 * $distanceProgram
 */
float distanceProgram;

void main() {
    //At this point, all that the projection matrix does is map extents to aspect * tan(fov / 2) and set z to -1.
    vec4 rayPos = mat * vec4(0., 0., 0., 1.);
    vec4 rayDir = invProjMat * vec4(2. * (vUv - 0.5), 0., 1.);

    //Vectorize
    rayDir.a = 0.;
    rayDir = mat * normalize(rayDir);

    float t = 0.;
    vec4 p;
    bool isInside = false;
    for(int i = 0; i < 800; ++i) {
        p = rayPos + t * rayDir;

        float dist = distance(p, rayPos, rayDir);

        if(-dist <= threshold && dist <= threshold && t > 0.) {
            gl_FragColor = vec4(p.xyz, float(i));
            return;
        }

        if(i == 0) {
            isInside = dist < 0.;
        }

        //Keep moving forward.
        if(isInside) {
            t -= dist;
        }
        else {
            t += dist;
        }

        if(t >= far || t < 0.) {
            break;
        }
    }
    gl_FragColor = vec4(-1.);
}
