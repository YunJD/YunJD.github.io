let heart = () => `
uniform float time;

float cone(in vec3 p) {
    float sphere = (length(p * vec3(1., 1.7, 1.)) - 1.) / 1.7;
    p.y -= -1.;
    vec3 c = vec3(1.);
    vec2 q = vec2( length(p.xz), -p.y );
    vec2 v = vec2( c.z*c.y/c.x, -c.z );
    vec2 w = v - q;
    vec2 vv = vec2( dot(v,v), v.x*v.x );
    vec2 qv = vec2( dot(v,w), v.x*w.x );
    vec2 d = max(qv,0.0)*qv/vv;
    return smin(sphere, sqrt( dot(w,w) - max(d.x,d.y) ) * sign(max(q.y*v.x-q.x*v.y,w.y)), 1.);
}

//Make sure to keep the function signatures the same.
float sdf(in vec3 p) {
    float lefty = length(p * vec3(1., 1., 1.5) - vec3(-1.1, 0., 0.)) - 1.5;
    
    float righty = length(p * vec3(1., 1., 1.5) - vec3(1.1, 0., 0.)) - 1.5;
    
    vec2 q = vec2(length(p.xz * vec2(1., 2.)) - 1., p.y + 0.3);
    float torus = (length(q) - 1.25) / 1.8;
    
    float sphereMid = (length(p * vec3(1.3, 1.6, 1.9) - vec3(0., -1.5, 0.)) - 1.2) / 1.9;
    float heartTop = smin(
        sphereMid,
        smin(smin(lefty, righty, 0.05), torus, 0.5),
        1.9
    );
    
    return smin(heartTop, cone(p * vec3(1.6, 1., 2.95) - vec3(0., -1.73, 0.)) / 2.95, 0.6);
}

vec3 gradient(in vec4 p, float t, float fovScale) {
    return NUM_GRAD3(sdf, p, 1e-3);
}

float distance(in vec4 pos, in vec4 dir, float t, int i) {
    return sdf((pos + t * dir).xyz);
}
`.trim();




let julia = () => `
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
`.trim();




let juliaSmoothNormal = () => `
uniform float time;

//Make sure to keep the function signatures the same.
float sdf(in vec3 p) {
    float t = time * 0.5;
    return julia4D(vec4(p, 0.),
        0.6 * vec4(cos(t), sin(0.2 + t * 1.05), cos(1.08 + t * 1.3), sin(2. + t * 1.8)));
}

vec3 gradient(in vec4 p, float t, float fovScale) {
    return NUM_GRAD3(sdf, p, 3.);
}

float distance(in vec4 pos, in vec4 dir, float t, int i) {
    //Ignore everything outside a sphere of radius 2.
	float tmin, tmax;
    float distJulia = 0.;
	if(!intersectSphere(2.001, pos.xyz, dir.xyz, tmin, tmax)) return 1e5;

    return sdf((pos + max(t, tmin) * dir).xyz);
}
`.trim();




let mandelbulb = () => `
uniform float time;

//Make sure to keep the function signatures the same.
float sdf(in vec3 p) {
    return mandelbulb(vec4(p, 0.), 8., time * 0.3);
}

vec3 gradient(in vec4 p, float t, float fovScale) {
    return NUM_GRAD3(sdf, p, clamp(t * 2e-4, 1e-5, 0.5));
}

float distance(in vec4 pos, in vec4 dir, float t, int i) {
    //Ignore everything outside a sphere of radius 2.
	float tmin, tmax;
    float distJulia = 0.;
	if(!intersectSphere(2.001, pos.xyz, dir.xyz, tmin, tmax)) return 1e5;

    return sdf((pos + max(t, tmin) * dir).xyz);
}
`.trim();




export default {
    //These keys match up with the thumbnails for the gallery.
    'julia': {
        code: julia()
    },
    'julia-smooth-normal': {
        code: juliaSmoothNormal(),
        aoParams: {
            nSamples: 0
        },
        envMap: 'norm-env.png'
    },
    'mandelbulb': {
        code: mandelbulb()
    },
    'heart': {
        code: heart()
    }
};
