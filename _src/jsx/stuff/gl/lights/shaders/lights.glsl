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
