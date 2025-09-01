export default ({ sdf }) => `
//SDF marcher

${sdf}

uniform float far;
uniform float threshold;

bool intersectSDF(vec4 rayPos, vec4 rayDir, float tmin, float tmax, out float t) {
    t = max(tmin, 0.);
    tmax = min(tmax, far);

    float dist = SDF_FN(rayPos, rayDir, t, 0);

    //Inside/outside
    float fSign = dist < 0. ? -1. : 1.;
    float prevSign = fSign;
    for(int i = 1; i <= MAX_STEPS; ++i) {
        if(abs(dist) < abs(min(threshold * t, 0.003))) {
            return t >= tmin && t < tmax;
        }

        t += fSign * dist;

        //Just some early exit
        if(t > 2. * tmax + threshold) {
            return false;
        }
        dist = SDF_FN(rayPos, rayDir, t, i);
    }
    return false;
}
`
