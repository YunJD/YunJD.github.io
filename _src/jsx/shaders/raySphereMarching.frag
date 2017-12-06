uniform mat4 invProjMat;
uniform mat4 mat;
varying vec2 vUv;

float distance(in vec4 p, in vec4 d) {
    $distanceProgram
}

void main() {
    //At this point, all that the projection matrix does is map extents to aspect * tan(fov / 2) and set z to -1.
    vec4 rayPos = mat * vec4(0., 0., 0., 1.);
    vec4 rayVec = invProjMat * vec4(2. * (vUv - 0.5), 0., 1.);
    //Vectorize
    rayVec.a = 0.;
    rayVec = mat * normalize(rayVec);
    for(int i = 0; i < 50; ++i) {
    }
}
