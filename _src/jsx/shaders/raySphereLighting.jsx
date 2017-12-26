import ops from 'stuff/gl/complex/shaders/ops.jsx';
import intersect from 'stuff/gl/geometry/shaders/intersect.jsx';
import differential from 'stuff/gl/geometry/shaders/differential.jsx';
import camera from 'stuff/gl/camera/shaders/camera.jsx';
import lights from 'stuff/gl/lights/shaders/lights.jsx';
import implicitFunction from 'stuff/gl/geometry/shaders/implicit_function.jsx';
import fractalSdf from 'stuff/gl/geometry/shaders/fractal_sdf.jsx';

export default ({maxSteps, sdf, distanceProgram, sampleDistance, nSamples, occlusionStrength}) => `
precision highp float;
precision highp int;
${ops()}
${intersect()}
${differential()}
${camera()}
${lights()}
${fractalSdf()}

#define SAMPLE_DISTANCE ${sampleDistance}
#define N_SAMPLES ${nSamples}
#define OCCLUSION_STRENGTH ${occlusionStrength}

${distanceProgram}

${implicitFunction({sdf, maxSteps})}

uniform sampler2D surfaceData;
uniform sampler2D envMap;

varying vec2 vUv;

void main() {
    DirectionLight directionLight = DirectionLight(
        normalize(vec3(-2., -1., -1.)),
        3.5 * vec3(255., 254., 246.) / 255.
    );

    PointLight pLight = PointLight(vec3(1., 5., 2.8), vec3(1., 1., 1.) * 70.);
    PointLight pLight2 = PointLight(vec3(-2., 1., 3.), vec3(1., 1., 1.) * 300.);

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
    float occTotal = 0.;

    for(int i = 0; i < N_SAMPLES; ++i) {
        //Strength decreases with distance because distant light is dimmer. Still just an approximation, and not a real simulation at all (no directionality for example, symmetrical shapes get occluded the same as non-symmetrical ones).
        float strength = 1. / (1. + t);
        occTotal += strength;
        occlusion += strength * max(abs(t - abs(distance(startPos, normal, t, i))) - 1e-2, 0.);
        t += stepSize;
    }

    vec3 color = vec3(0.);
    float tmax = 0.;
    float vv = 0.;

    vec4 lightDir;

    #define CONTRIBUTE_COLOR(light) lightDir = vec4(sampleDirectLight(light, startPos.xyz, tmax), 0.);\
    if(!intersectImplicit(startPos, lightDir, 1e-1, tmax, vv)) {\
        color += Le(light, startPos.xyz) * max(0., dot(lightDir, normal)) * (0.6 / 3.14159265);\
    }

    CONTRIBUTE_COLOR(pLight)
    CONTRIBUTE_COLOR(pLight2)
    CONTRIBUTE_COLOR(directionLight)

    float theta = acos(clamp(normal.y, -1., 1.));
    float phi = atan(normal.z, normal.x);
    phi = phi < 0. ? phi + 2. * 3.1415926536 : phi;

    vec4 amb = texture2D(envMap, vec2(
        phi / (2. * 3.1415926536),
        1. - theta / 3.1415926536
    ));

    gl_FragColor = vec4(0.6 * amb.xyz * (1. - clamp(occlusion, 0., 1.)) + color, 1.);
}
`;
