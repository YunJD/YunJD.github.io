import includes from './raySphereLightingIncludes.glsl';

const program = `
uniform sampler2D surfaceData;

varying vec2 vUv;

PointLight lights[2];

void main() {
    lights[0] = PointLight(vec3(0.8, 2.7, 0.), vec3(100.));
    lights[1] = PointLight(vec3(1., 1., 2.), 0.7 * vec3(30., 60., 100.));

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
        //Strength decreases with distance, square cubed law and such. Still just an approximation, and not a real simulation at all (no directionality for example, symmetrical shapes get occluded the same as non-symmetrical ones).
        float strength = float(SAMPLE_DISTANCE) * pow((1. - float(i) / float(N_SAMPLES)), 2.);
        total += t * strength;
        occlusion += strength * abs(t - abs(distance(startPos + t * normal, t, i)));
        t += stepSize;
    }

    vec3 color = vec3(0.);
    float tmax = 0.;
    float vv = 0.;
    for(int i = 0; i < 2; ++i) {
        vec4 lightDir = vec4(sampleDirectLight(lights[i], startPos.xyz, tmax), 0.);
        if(!intersectImplicit(startPos, lightDir, 1e-1, tmax, vv)) {
            //TODO: Materials, currently the 0.2 is the albedo for the diffuse surface
            color += Le(lights[i], startPos.xyz) * max(0., dot(lightDir, normal)) * (0.8 / 3.14159265);
        }
    }
    gl_FragColor = vec4(color, 1. - clamp(occlusion / total, 0., 0.9));
}
`.trim();

//Workaround because includes clash with glsl-man
export default function(params) {
    return includes(params) + '\n' + program;
}
