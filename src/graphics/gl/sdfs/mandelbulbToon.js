export default `
#define MANDELBULB_ITERATIONS 12

float mandelbulb(in vec3 p, float power, float phaseShift) {
    vec3 pos = p.xzy;
    vec3 z = pos;

    float dr = 1.;
    float r = 0.;

    for(int i = 0; i < MANDELBULB_ITERATIONS; ++i) {
        r = length(z);
        if(r > 2.) break;

        //Convert to polar coordinates
        float theta = acos(z.z / r) - phaseShift;
        float phi = atan(z.y, z.x);
        dr = power * pow(r, power - 1.) * dr + 1.;

        float zr = pow(r, power);
        theta *= power;
        phi *= power;

        //Convert back to cartesian coordinates
        float sinTheta = sin(theta);
        z = zr * vec3(
            sinTheta * cos(phi), sinTheta * sin(phi), cos(theta)
        ) + pos;
    }
    return 0.5 * log(r) * r / dr;
}

float sdf(in vec3 pos) {
    return mandelbulb(pos, 8., time * 4000.);
}

//See Tetrahedron technique https://iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
//This function is used to estimate the gradient/surface normal.
vec3 gradient(in vec3 p) {
    float h = pixelScale * 1e4 * max(zoomScale / tanFov, 3e-4);
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
`
