let sierpinski = () => `
uniform float time;
#define ITER 16
#define SCALE 1.8

const mat3 rot = mat3(
    cos(0.1), -sin(0.1), 0.,
    sin(0.1), cos(0.1), 0.,
    0., 0., 1.
);


//Make sure to keep the function signatures the same.
float sdf(in vec3 p) {
    mat3 rot2 = mat3(
        1., 0., 0.,
        0., cos(time * 0.3), -sin(time * 0.3),
        0., sin(time * 0.3), cos(time * 0.3)
    );
    vec3 z = p;
    for(int i = 0; i < ITER; ++i) {
       if(z.x+z.y<0.) z.xy = -z.yx; // fold 1
       if(z.x+z.z<0.) z.xz = -z.zx; // fold 2
       if(z.y+z.z<0.) z.zy = -z.yz; // fold 3
       z = rot2 * rot * (SCALE * (z + vec3(0., 0.25, 0.1)) - vec3(1.));
    }
    return (length(max(abs(z) - 20., 0.))) * pow(SCALE, -float(ITER));
}

vec3 gradient(in vec4 p, float t, float fovScale) {
    return NUM_GRAD3(sdf, p, 1e-3);
}

float distance(in vec4 pos, in vec4 dir, float t, int i) {
    return sdf((pos + t * dir).xyz);
}
`;




let menger = () => `
uniform float time;

float box(in vec3 p, in vec3 b) {
    vec3 d = abs(p) - b;
    return min(max(d.x, max(d.y, d.z)), 0.) + length(max(d, 0.));
}

float box2(in vec2 p, in vec2 b) {
    vec2 d = abs(p) - b;
    return min(max(d.x, d.y), 0.) + length(max(d, 0.));
}

float cross(in vec3 p) {
    vec2 unit = vec2(1.);
    return min(
        box2(p.xy, unit),
        min(
            box2(p.yz, unit),
            box2(p.xz, unit)
        )
    );
}
//Signs are probably wrong :)
const mat3 rot = mat3(
    cos(0.45), -sin(0.45), 0.,
    sin(0.45), cos(0.45), 0.,
    0., 0., 1.
);
const mat3 rot2 = mat3(
    cos(0.5), 0., -sin(0.5),
    0., 1., 0.,
    sin(0.5), 0., cos(0.5)
);

float sdf(in vec3 p) {
    float d = length(max(abs(p) - vec3(2.), 0.));
    float scale = 0.35;
    vec3 tp = p;
    
    for(int i = 0; i < 6; ++i) {
        tp = rot2 * rot * tp;
        vec3 mp = mod(tp * scale, 2.) - 1.;
        scale *= 3.;
        float c = cross(3. * abs(mp) - 1.) / scale;
        d = max(d, c);
    }
    return min(p.y + 2., d);
}

vec3 gradient(in vec4 p, float t, float fovScale) {
    return NUM_GRAD3(sdf, p, clamp(t * 2e-3, 1e-3, 0.5));
}

float distance(in vec4 pos, in vec4 dir, float t, int i) {
    return sdf((pos + t * dir).xyz);
}
`;




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
    p *= 2.;
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
    
    return smin(heartTop, cone(p * vec3(1.6, 1., 2.95) - vec3(0., -1.73, 0.)) / 2.95, 0.6) * 0.5;
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




let julia3 = () => `
uniform float time;

//Make sure to keep the function signatures the same.
float sdf(in vec3 p) {
    float t = time * 0.5;
    return julia3D(
        vec4(p, 0.),
        0.5 * vec3(cos(t), sin(0.2 + t * 1.05), cos(1.08 + t * 1.3)), 
        2.
    );
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
    'julia3': {
        code: julia3(),
        envMap: 'gloucester-env.png'
    },
    //These keys match up with the thumbnail names for the gallery.
    'mandelbulb': {
        code: mandelbulb(),
        envMap: 'gloucester-env.png'
    },
    'menger': {
        code: menger(),
        envMap: 'theatre-center-env.png'
    },
    'sierpinski': {
        code: sierpinski(),
        envMap: 'norm-1-env.png'
    },
    'julia': {
        code: julia(),
        envMap: 'gravel-plaza-env.png'
    },
    'julia-smooth-normal': {
        code: juliaSmoothNormal(),
        aoParams: {
            nSamples: 0
        },
        envMap: 'norm-1-env.png'
    },
    'heart': {
        code: heart()
    },
};
