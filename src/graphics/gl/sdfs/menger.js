export default `
float menger(in vec3 p, float timeShift) {
    const int iterations = 10;
    float scale = 3.;
    float adjTime = 1000. * time;
    vec3 z = p;
    for(int i = 0; i < iterations; ++i) {
        z = abs(z);
        if(z.x < z.y) z.xy = z.yx;
        if(z.y < z.z) z.yz = z.zy;
        if(z.x < z.y) z.xy = z.yx;

        z = z * scale - (scale - 1.) * vec3(1., 1.7, 3. * fract(adjTime + timeShift));

        if(z.z < -1.) z.z += 2.;
    }
    float norm = pow(scale, -float(iterations));
    return length(max(abs(z - 1.) * norm, 0.)) - clamp(zoomScale * 2e-2, 1e-8, 3e-3);
}

float sdf(in vec3 p) {
    return sdfUnion(menger(p, 0.66), sdfUnion(menger(p, 0.), menger(p, 0.33)));
}

//See Tetrahedron technique https://iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
//This function is used to estimate the gradient/surface normal.
vec3 gradient(in vec3 p) {
    float h = clamp(zoomScale * 1e-3, 1e-7, 1e-3);
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
    if(!intersectSphere(3.001, pos.xyz, dir.xyz, tmin, tmax)) {
        return 1e5;
    }
    
    //Skip t to the closer hitpoint of the sphere.
    return sdf((pos + max(t, tmin) * dir).xyz);
}
`
