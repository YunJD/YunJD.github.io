//This is the initial program.
export default {
julia: () => `
uniform float time;

//Make sure to keep the function signatures the same.
float sdf(in vec3 p) {
    float t = time * 0.5;
    return julia4D(vec4(p, 0.),
        0.6 * vec4(cos(t), sin(0.2 + t * 1.05), cos(1.08 + t * 1.3), sin(2. + t * 1.8)));
}

vec3 gradient(in vec4 p, float t, float fovScale) {
    return NUM_GRAD3(sdf, p, clamp(t * 2e-3, 1e-3, 0.5));
}

float distance(in vec4 pos, in vec4 dir, float t, int i) {
    //Ignore everything outside a sphere of radius 2.
	float tmin, tmax;
    float distJulia = 0.;
	if(!intersectSphere(2.001, pos.xyz, dir.xyz, tmin, tmax)) return 1e5;

    return sdf((pos + max(t, tmin) * dir).xyz);
}
`.trim(),

mandelbulb: () => `
uniform float time;

//Make sure to keep the function signatures the same.
float sdf(in vec3 p) {
    return mandelbulb(vec4(p, 0.), 8., time * 0.3);
}

vec3 gradient(in vec4 p, float t, float fovScale) {
    return NUM_GRAD3(sdf, p, clamp(t * 2e-4, 1e-4, 0.5));
}

float distance(in vec4 pos, in vec4 dir, float t, int i) {
    //Ignore everything outside a sphere of radius 2.
	float tmin, tmax;
    float distJulia = 0.;
	if(!intersectSphere(2.001, pos.xyz, dir.xyz, tmin, tmax)) return 1e5;

    return sdf((pos + max(t, tmin) * dir).xyz);
}
`.trim()
};
