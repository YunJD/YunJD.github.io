#include stuff/gl/complex/shaders/ops.glsl;
#include stuff/gl/geometry/shaders/intersect.glsl;
#include stuff/gl/geometry/shaders/differential.glsl;
#include stuff/gl/camera/shaders/camera.glsl;

#define SAMPLE_DISTANCE $sampleDistance
#define N_SAMPLES $nSamples
#define OCCLUSION_STRENGTH $occlusionStrength

uniform sampler2D surfaceData;

varying vec2 vUv;

/* Must use string replace here because the webpack glsl template loader will throw an error with just 
 *
 * $distanceProgram
 */
float distanceProgram;

void main() {
    vec4 data = texture2D(surfaceData, vUv);
    if(data.w == -1.) {
        return;
    }

    vec4 rayPos = getCameraPos();
    vec4 rayDir = getCameraRay(vUv);
    vec4 startPos = rayPos + data.w * rayDir;
    vec4 normal = vec4(data.xyz, 0.);
    normal *= dot(rayDir, normal) < 0. ? 1. : -1.;

    float occlusion = 0.;
    float stepSize = float(SAMPLE_DISTANCE) / float(N_SAMPLES);
    float t = 1e-3;
    //Normalization factor. More samples should not change the brightness!
    float total = 0.;

    for(int i = 0; i < N_SAMPLES; ++i) {
        //Strength decreases with distance, square cubed law and such. Still just an approximation, and not a real simulation at all (no directionality for example, symmetrical shapes get occluded the same as non-symmetrical ones).
        float strength = float(SAMPLE_DISTANCE) * pow((1. - float(i) / float(N_SAMPLES)), 2.);
        total += t * strength;
        occlusion += strength * abs(t - abs(distance(startPos + t * normal, t, i)));
        t += stepSize;
    }
    gl_FragColor = vec4(1. - clamp(occlusion / total, 0., 0.9));
}
