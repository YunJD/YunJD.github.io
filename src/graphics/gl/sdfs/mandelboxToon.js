export default `
#define ITER 12
#define FIXED_RADIUS 1.
#define MIN_RADIUS 0.5
const float minRad2 = MIN_RADIUS * MIN_RADIUS;

float sdf(in vec3 p) {
    float SCALE = -(2.75 + 0.8 * cos(time * 10000.));
    float rescale = 2.;
    
    vec4 scaleVec = vec4(SCALE, SCALE, SCALE, abs(SCALE)) / minRad2;
    float C1 = abs(SCALE - 1.); float C2 = pow(abs(SCALE), float(1 - ITER));
    
    p *= rescale;

    vec4 z = vec4(p, 1.);
    vec4 p0 = vec4(p, 1.);
    for(int i = 0; i < ITER; ++i) {
        z.xyz = clamp(z.xyz, -1., 1.) * 2. - z.xyz; //Box fold
        float r2 = dot(z.xyz, z.xyz);
        z.xyzw *= clamp(max(minRad2 / r2, minRad2), 0., 1.); //Sphere fold
        z.xyzw = scaleVec * z + p0;
    }
    return ((length(z.xyz) - C1) / z.w - C2) / rescale;
}

//See Tetrahedron technique https://iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
//This function is used to estimate the gradient/surface normal.
vec3 gradient(in vec3 p, float h) {
    const vec2 k = vec2(1, -1);
    return normalize(
        k.xyy * sdf(p + k.xyy * h) +
        k.yyx * sdf(p + k.yyx * h) +
        k.yxy * sdf(p + k.yxy * h) +
        k.xxx * sdf(p + k.xxx * h)
    );
}

vec3 gradient(in vec3 p) {
    return gradient(p, pixelScale * 0.5 * max(zoomScale / tanFov, 3e-4));
}

float getSdfFromCamera(in vec4 pos, in vec4 dir, float t) {
    return sdf((pos + t * dir).xyz);
}

float changeInSteps(in vec4 o) {
    vec2 vd = vec2(1.5 * pixelScale, 0.);
    vec4 l = texture2D(surfaceData, vUv + vd.xy);
    vec4 r = texture2D(surfaceData, vUv - vd.xy);
    vec4 u = texture2D(surfaceData, vUv + vd.yx);
    vec4 d = texture2D(surfaceData, vUv - vd.yx);
    return (
        max(
            max(
                max(
                    abs(o.x - l.x),
                    abs(o.x - r.x)
                ),
                abs(o.x - u.x)
            ),
            abs(o.x - d.x)
        )
    );
}
`
