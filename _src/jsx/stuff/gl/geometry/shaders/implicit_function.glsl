#define MAX_STEPS $maxSteps
#define SDF_FN $sdf

uniform float far;
uniform float threshold;

bool intersectImplicit(vec4 rayPos, vec4 rayDir, float tmin, float tmax, out float t) {
    t = max(tmin, 0.1);
    tmax = min(tmax, far);

    float dist = SDF_FN(rayPos + t * rayDir, t, 0);
    float decay = 1.;//March by less than the full sphere distance, helps with certain functions.

    //Inside/outside
    float fSign = dist < 0. ? -1. : 1.;
    for(int i = 1; i <= MAX_STEPS; ++i) {
        float precis = threshold * t;
        if(abs(dist) < abs(precis)) {
            return t >= tmin - threshold && t <= tmax + threshold;
        }

        t += fSign * dist * decay;
        //Just some early exit
        if(t > tmax * 2.) {
            return false;
        }
        dist = SDF_FN(rayPos + t * rayDir, t, i);
        decay *= i >= 200 ? 0.99 : 1.;
    }
    return false;
}
