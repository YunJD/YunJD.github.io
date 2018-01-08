let sierpinski2 = () => `
uniform float time;
#define ITER 20
#define SCALE 1.6
const float invScale = pow(SCALE, -float(ITER));


//Make sure to keep the function signatures the same.
float sdf(in vec3 p) {
    float t = time * 0.3;
    float s = sin(t);
    float c = cos(t);
    mat3 rot = mat3(
        1., 0., 0.,
        0., c, -s,
        0., s, c
    );
    
    t = time * 0.1;
    s = sin(t);
    c = cos(t);
    mat3 rot2 = mat3(
        c, -s, 0.,
        s, c, 0.,
        0., 0., 1.
    );
    
    t = time * 0.05;
    s = sin(t);
    c = cos(t);
    mat3 rot3 = mat3(
        c, 0., -s,
        0., 1., 0.,
        s, 0., c
    );
    vec3 z = p;
    for(int i = 0; i < ITER; ++i) {
        z = i < 9 ? rot3 * rot2 * rot * z : z;
        if(z.x+z.y<0.) z.xy = -z.yx; // fold 1
        if(z.x+z.z<0.) z.xz = -z.zx; // fold 2
        if(z.y+z.z<0.) z.zy = -z.yz; // fold 3
        z = (SCALE * (z - 0.5 * abs(vec3(cos(time * 0.01), cos(time * 0.05), cos(time * 0.1)))) - 1.);
        //z = i == 10 ? rot * z : z;
    }
    return (length(z) - 5.) * invScale;
}

vec3 gradient(in vec4 p, float t, float fovScale) {
    return NUM_GRAD3(sdf, p, clamp(t * 1e-3, 1e-5, 0.1));
}

float distance(in vec4 pos, in vec4 dir, float t, int i) {
    return sdf((pos + t * dir).xyz);
}
`;




let mandelbox = () => `
#define SCALE -2.
#define FIXED_RADIUS 1.
#define MIN_RADIUS 0.5
#define ITER 20
const float minRad2 = MIN_RADIUS * MIN_RADIUS;
const vec4 scaleVec = vec4(SCALE, SCALE, SCALE, abs(SCALE)) / minRad2;
const float C1 = abs(SCALE - 1.); const float C2 = pow(abs(SCALE), float(1 - ITER));

uniform float time;

//Make sure to keep the function signatures the same.
float sdf(in vec3 p) {
    vec4 z = vec4(p, 1.);
    vec4 p0 = vec4(p, 1.);
    for(int i = 0; i < ITER; ++i) {
        z.xyz = clamp(z.xyz, -1., 1.) * 2. - z.xyz; //Box fold
        float r2 = dot(z.xyz, z.xyz);
        z.xyzw *= clamp(max(minRad2 / r2, minRad2), 0., 1.); //Sphere fold
        z.xyzw = scaleVec * z + p0;
    }
    return (length(z.xyz) - C1) / z.w - C2;
}

vec3 gradient(in vec4 p, float t, float fovScale) {
    return NUM_GRAD3(sdf, p, clamp(t * 1e-3, 1e-5, 0.1));
}

float distance(in vec4 pos, in vec4 dir, float t, int i) {
    return sdf((pos + t * dir).xyz);
}
`;




let sierpinski = () => `
uniform float time;
#define ITER 25
#define SCALE 1.3
const float invScale = pow(SCALE, -float(ITER));


//Make sure to keep the function signatures the same.
float sdf(in vec3 p) {
    float t = time * 0.3;
    float s = sin(t);
    float c = cos(t);
    mat3 rot = mat3(
        1., 0., 0.,
        0., c, -s,
        0., s, c
    );
    
    t = time * 0.1;
    s = sin(t);
    c = cos(t);
    mat3 rot2 = mat3(
        c, -s, 0.,
        s, c, 0.,
        0., 0., 1.
    );
    
    t = time * 0.05;
    s = sin(t);
    c = cos(t);
    mat3 rot3 = mat3(
        c, 0., -s,
        0., 1., 0.,
        s, 0., c
    );
    vec3 z = p;
    for(int i = 0; i < ITER; ++i) {
        if(z.x+z.y<0.) z.xy = -z.yx; // fold 1
        if(z.x+z.z<0.) z.xz = -z.zx; // fold 2
        if(z.y+z.z<0.) z.zy = -z.yz; // fold 3
        z = rot3 * rot2 * rot * (SCALE * (z - 0.5 * abs(vec3(cos(time * 0.2), cos(time * 0.4), cos(time * 0.1)))) - 0.2);
    }
    return (length(max(abs(z) - 2., 0.))) * invScale;
}

vec3 gradient(in vec4 p, float t, float fovScale) {
    return NUM_GRAD3(sdf, p, clamp(t * 1e-3, 1e-5, 0.1));
}

float distance(in vec4 pos, in vec4 dir, float t, int i) {
    return sdf((pos + t * dir).xyz);
}
`;




let menger = () => `
uniform float time;
#define ITER 15
#define SCALE 2.8
const float invScale = pow(SCALE, -float(ITER));


//Make sure to keep the function signatures the same.
float sdf(in vec3 p) {
    float t = time * 0.3;
    float s = sin(t);
    float c = cos(t);
    mat3 rot = mat3(
        1., 0., 0.,
        0., c, -s,
        0., s, c
    );
    
    t = time * 0.1;
    s = sin(t);
    c = cos(t);
    mat3 rot2 = mat3(
        c, -s, 0.,
        s, c, 0.,
        0., 0., 1.
    );
    
    t = time * 0.05;
    s = sin(t);
    c = cos(t);
    mat3 rot3 = mat3(
        c, 0., -s,
        0., 1., 0.,
        s, 0., c
    );

    vec3 z = p;
    for(int i = 0; i < ITER; ++i) {
        z = i < 2 ? rot2 * rot * z : z;
        z = i > 1 ? rot3 * rot2 * rot * z : z;
        z = abs(z);
        if(z.x < z.y) z.xy = z.yx;
        if(z.y < z.z) z.yz = z.zy;
        if(z.x < z.y) z.xy = z.yx;

        z = (SCALE * (z - .8 * abs(vec3(cos(time * 0.1), cos(time * 0.15), cos(time * 0.25)))) - (SCALE - 1.));

        if(z.z < -1.) z.z += 2.;
    }
    return length(max(abs(z) - 1., 0.)) * invScale;
}

vec3 gradient(in vec4 p, float t, float fovScale) {
    return NUM_GRAD3(sdf, p, clamp(t * 1e-3, 1e-5, 0.1));
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
    'mandelbox': {
        code: mandelbox(),
        envMap: 'gloucester-env.png'
    },
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
    'sierpinski2': {
        code: sierpinski2(),
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
