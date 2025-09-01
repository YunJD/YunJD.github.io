import intersect from '/src/graphics/gl/geometry/shaders/intersect'
import camera from '/src/graphics/gl/camera/shaders/camera'

export default `
precision highp float;
precision highp int;

#define M_PI 3.1415926535897932384626433832795
#define MAX_STEPS 50

#define ITERATIONS 20

uniform float time;
varying vec2 vUv;

${intersect.trim()}

${camera.trim()}

float julia4D(in vec4 p, in vec4 c) {
    vec4 z = p;
    vec4 grad = vec4(1., 0., 0., 0.);

    float mz2 = dot(z, z);
    float md2 = 1.;

    for(int i = 0; i < ITERATIONS; ++i) {
        if(mz2 > 4.) { break; }
        md2 *= 4. * mz2;
        z = vec4(z.x * z.x - dot(z.yzw, z.yzw), 2.0 * z.x * z.yzw) + c;
        mz2 = dot(z, z);
    }

    return 0.25 * sqrt(mz2 / md2) * log(mz2);
}

float sdf(in vec3 pos) {
    float t = time * 15000.;
    return julia4D(
        vec4(pos, 0.),
        0.6 * vec4(cos(t), sin(0.2 + t * 1.05), cos(1.08 + t * 1.3), sin(2. + t * 1.8))
    );
}

//See Tetrahedron technique https://iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
//This function is used to estimate the gradient/surface normal.
vec3 gradient(in vec3 p) {
    //Somewhat adaptive threshold for the tetrahedron
    float h = 8e-1;
    const vec2 k = vec2(1, -1);
    return normalize(
        k.xyy * sdf(p + k.xyy * h) +
        k.yyx * sdf(p + k.yyx * h) +
        k.yxy * sdf(p + k.yxy * h) +
        k.xxx * sdf(p + k.xxx * h)
    );
}

float getSdfFromCamera(in vec4 pos, in vec4 dir, float t) {
    //Quick exit, if the ray does not intersect a sphere of radius 2
    float tmin, tmax;
    if(!intersectSphere(2.001, pos.xyz, dir.xyz, tmin, tmax)) {
        return 1e5;
    }
    
    //Skip t to the closer hitpoint of the sphere.
    return sdf((pos + max(t, tmin) * dir).xyz);
}

bool intersectSdf(vec4 rayPos, vec4 rayDir, float tmin, float tmax, out float t, out float steps) {
    t = max(tmin, 1e-5);
    tmax = min(tmax, 1000.);

    const float adaptiveThreshold = 5e-4;

    for(int i = 0; i < MAX_STEPS; ++i) {
        float dist = getSdfFromCamera(rayPos, rayDir, t);
        float absDist = abs(dist);
        t += absDist;
        if(dist >= 1e5) {
            return false;
        }
        if(absDist <= adaptiveThreshold) {
            steps = float(i);
            return t >= tmin && t < tmax;
        }
    }
    return false;
}

void main() {
    gl_FragColor = vec4(-1.);

    vec4 rayPos = getCameraPos();
    vec4 rayDir = getCameraRay(vUv);

    float bbmin, bbmax;

    //Slice the scene with a cube
    if(intersectAABB(vec3(-5.), vec3(5.), rayPos.xyz, rayDir.xyz, bbmin, bbmax)) {
        float t, steps;
        if(intersectSdf(rayPos, rayDir, bbmin, bbmax, t, steps)) {
            vec4 normal = vec4(normalize(gradient((rayPos + t * rayDir).xyz)), 0.);
            gl_FragColor = 0.5 * vec4(sin(normal.x), sin(normal.y), cos(normal.z), 1.) + 0.5;
        }
    }
}
`
