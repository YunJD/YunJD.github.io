export default ({maxSteps, sdf}) => `
#define MAX_STEPS ${maxSteps}
#define SDF_FN ${sdf}

uniform float far;
uniform float threshold;

vec2 opUnion(in vec2 a, in vec2 b) {
    return a.x <= b.x ? a : b;
}

bool intersectImplicit(vec4 rayPos, vec4 rayDir, float tmin, float tmax, out float t) {
    t = max(tmin, 0.);
    tmax = min(tmax, far);

    float dist = SDF_FN(rayPos, rayDir, t, 0);

    //Inside/outside
    float fSign = dist <= 0. ? -1. : 1.;
    for(int i = 1; i <= MAX_STEPS; ++i) {
        if(abs(dist) < threshold) {
            return t >= tmin && t < tmax;
        }

        t += fSign * dist;
        //Just some early exit
        if(t > tmax + threshold) {
            return false;
        }
        dist = SDF_FN(rayPos, rayDir, t, i);
    }
    return false;
}
`
