export default `
//Lighting functions

struct PointLight {
    vec3 position;
    vec3 intensity;
};

vec3 sampleDirectLight(in PointLight light, in vec3 pos, out float tmax) {
    vec3 lightdir = light.position - pos;
    tmax = length(lightdir);
    return lightdir / tmax;
}

vec3 Le(in PointLight light, in vec3 pos) {
    vec3 r = light.position - pos;
    return light.intensity / (4. * 3.14159265 * dot(r, r));
}

struct DirectionLight {
    vec3 direction;
    vec3 intensity;
};

vec3 sampleDirectLight(in DirectionLight light, in vec3 pos, out float tmax) {
    tmax = 1e6;
    return -light.direction;
}

vec3 Le(in DirectionLight light, in vec3 pos) {
    return light.intensity;
}
`
