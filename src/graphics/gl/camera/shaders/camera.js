export default `
//Camera functions
uniform mat4 invProjectionMat;
uniform mat4 cameraMat;
uniform float zoomScale;

vec4 getCameraPos() {
    return cameraMat * vec4(0., 0., 0., 1.);
}

vec4 getCameraRay(in vec2 normPixel) {
    vec4 dir = invProjectionMat * vec4(2. * zoomScale * (normPixel - 0.5), 0., 1.);
    dir.w = 0.;
    dir = cameraMat * normalize(dir);
    return dir;
}
`
