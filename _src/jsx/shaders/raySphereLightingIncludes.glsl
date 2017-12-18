#include stuff/gl/complex/shaders/ops.glsl;
#include stuff/gl/geometry/shaders/intersect.glsl;
#include stuff/gl/geometry/shaders/differential.glsl;
#include stuff/gl/camera/shaders/camera.glsl;
#include stuff/gl/lights/shaders/lights.glsl;

#define SAMPLE_DISTANCE $sampleDistance
#define N_SAMPLES $nSamples
#define OCCLUSION_STRENGTH $occlusionStrength

/* Must use string replace here because the webpack glsl template loader will throw an error with just 
 *
 * $distanceProgram
 */
float distanceProgram;

#include stuff/gl/geometry/shaders/implicit_function.glsl;
