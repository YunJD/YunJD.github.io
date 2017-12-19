import ops from 'stuff/gl/complex/shaders/ops.jsx';
import intersect from 'stuff/gl/geometry/shaders/intersect.jsx';
import differential from 'stuff/gl/geometry/shaders/differential.jsx';
import camera from 'stuff/gl/camera/shaders/camera.jsx';
import lights from 'stuff/gl/lights/shaders/lights.jsx';
import implicitFunction from 'stuff/gl/geometry/shaders/implicit_function.jsx';

export default ({maxSteps, sdf, distanceProgram, sampleDistance, nSamples, occlusionStrength}) => `
precision highp float;
precision highp int;
${ops()}
${intersect()}
${differential()}
${camera()}
${lights()}

#define SAMPLE_DISTANCE ${sampleDistance}
#define N_SAMPLES ${nSamples}
#define OCCLUSION_STRENGTH ${occlusionStrength}

${distanceProgram}

${implicitFunction({sdf, maxSteps})}

uniform sampler2D surfaceData;

varying vec2 vUv;

void main() {
    DirectionLight directionLight = DirectionLight(
        normalize(vec3(-0.7, -1., -0.5)),
        vec3(2.8, 2.8, 2.9)
    );

    PointLight pLight;
    pLight = PointLight(vec3(1., 1., 0.8), 0.01 * vec3(10., 10., 80.));

    vec4 data = texture2D(surfaceData, vUv);
    if(data.w == -1.) {
        return;
    }

    vec4 rayPos = getCameraPos();
    vec4 rayDir = getCameraRay(vUv);
    vec4 startPos = rayPos + data.w * rayDir;
    vec4 normal = vec4(data.xyz, 0.);
    float cameraCos = dot(rayDir, normal);
    normal *= cameraCos < 0. ? 1. : -1.;
    cameraCos = dot(-rayDir, normal);

    float occlusion = 0.;
    float stepSize = float(SAMPLE_DISTANCE) / float(N_SAMPLES);
    float t = 1e-3;
    //Normalization factor. More samples should not change the brightness!
    float total = 0.;

    for(int i = 0; i < N_SAMPLES; ++i) {
        //Strength decreases with distance because distant light is dimmer. Still just an approximation, and not a real simulation at all (no directionality for example, symmetrical shapes get occluded the same as non-symmetrical ones). The number of samples should not affect how dark it gets, and this strength param handles that nicely.
        float strength = 1. / (1. + t);
        total += strength;
        occlusion += strength * abs(t - abs(distance(startPos + t * normal, t, i)));
        t += stepSize;
    }

    vec3 color = vec3(0.);
    float tmax = 0.;
    float vv = 0.;

    vec4 lightDir;

    #define CONTRIBUTE_COLOR(light) lightDir = vec4(sampleDirectLight(light, startPos.xyz, tmax), 0.);\
    if(!intersectImplicit(startPos, lightDir, 1e-1, tmax, vv)) {\
        color += Le(light, startPos.xyz) * max(0., dot(lightDir, normal)) * (0.83 / 3.14159265);\
    }

    CONTRIBUTE_COLOR(pLight)
    CONTRIBUTE_COLOR(directionLight)

    gl_FragColor = vec4(color, 1. - clamp(occlusion / total, 0., 0.9));
}
`;
