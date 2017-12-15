//Stuff related to raytracing

uniform mat4 invProjMat;
uniform mat4 cameraMat;

vec4 getCameraPos() {
    return cameraMat * vec4(0., 0., 0., 1.);
}

vec4 getCameraRay(in vec2 normPixel) {
    vec4 dir = invProjMat * vec4(2. * (normPixel - 0.5), 0., 1.);
    dir.a = 0.;
    dir = cameraMat * normalize(dir);
    return dir;
}
