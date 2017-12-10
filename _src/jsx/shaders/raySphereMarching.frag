uniform float far;
uniform float threshold;
uniform mat4 invProjMat;
uniform mat4 mat;
varying vec2 vUv;
precision highp float;

float distance(in vec4 p, in vec4 rp, in vec4 rd) {
    $distanceProgram
}

void main() {
    //At this point, all that the projection matrix does is map extents to aspect * tan(fov / 2) and set z to -1.
    vec4 rayPos = mat * vec4(0., 0., 0., 1.);
    vec4 rayDir = invProjMat * vec4(2. * (vUv - 0.5), 0., 1.);

    //Vectorize
    rayDir.a = 0.;
    rayDir = mat * normalize(rayDir);

    float t = 0.;
    vec4 p;
    for(int i = 0; i < 800; ++i) {
        p = rayPos + t * rayDir;
        float dist = distance(p, rayPos, rayDir);
        float absDist = abs(dist);
        if(abs(dist) <= threshold) {
            gl_FragColor = vec4(p.xyz, float(i));
            return;
        }
        if(absDist < 1e-5) {
            dist = 1e-5 * absDist / dist;
        }
        t += dist;
        if(t >= far || t < 0.) {
            break;
        }
    }
    gl_FragColor = vec4(0., 0., 0., -1.);
}
