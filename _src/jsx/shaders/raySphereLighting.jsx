import complexOps from 'stuff/gl/complex/shaders/ops.jsx';
import intersect from 'stuff/gl/geometry/shaders/intersect.jsx';
import differential from 'stuff/gl/geometry/shaders/differential.jsx';
import camera from 'stuff/gl/camera/shaders/camera.jsx';
import lights from 'stuff/gl/lights/shaders/lights.jsx';
import sdfOps from 'stuff/gl/geometry/shaders/sdf_ops.jsx';
import sdfMarcher from 'stuff/gl/geometry/shaders/sdf_marcher.jsx';
import fractalSdf from 'stuff/gl/geometry/shaders/fractal_sdf.jsx';

export default ({maxSteps, sdf, distanceProgram, sampleDistance, nSamples, occlusionStrength}) => `
precision highp float;
precision highp int;
${complexOps()}
${sdfOps()}
${intersect()}
${differential()}
${camera()}
${lights()}
${fractalSdf()}

#define SAMPLE_DISTANCE ${sampleDistance}
#define N_SAMPLES ${nSamples}
#define OCCLUSION_STRENGTH ${occlusionStrength}

${distanceProgram}

${sdfMarcher({sdf, maxSteps})}

uniform sampler2D surfaceData;
uniform sampler2D envMap;

varying vec2 vUv;

DirectionLight directionLight = DirectionLight(
    normalize(vec3(-0.3, -1., -1.)),
    4. * vec3(255., 244., 226.) / 255.
);

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
    float stepSize = float(SAMPLE_DISTANCE) / max(1e-4, float(N_SAMPLES));
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
