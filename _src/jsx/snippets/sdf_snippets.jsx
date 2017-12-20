//This is the initial program.

export default `
uniform float time;
//Make sure to keep the function signatures the same of every function here!

vec3 gradient(in vec4 p) {
	float mTime = time * 0.0005;
    return julia4DGrad(vec4(p.xyz, 0.), vec4(0.5, 0.52, 0.55, 0.5)
        * vec4(-cos(mTime), cos(0.5 * mTime), cos(0.08 * mTime), cos(2. * mTime))).xyz;
}

float distance(in vec4 pos, in vec4 dir, float t, int i) {
	float mTime = time * 0.0005;

	float tmin, tmax;
    float distJulia = 0.;
	if(!intersectSphere(3., pos.xyz, dir.xyz, tmin, tmax)) return 1e5;

    return julia4D(vec4(pos.xyz, 0.) + max(t, tmin) * dir, vec4(0.5, 0.52, 0.55, 0.5)
        * vec4(-cos(mTime), cos(0.5 * mTime), cos(0.08 * mTime), cos(2. * mTime)));
}
`.trim()
