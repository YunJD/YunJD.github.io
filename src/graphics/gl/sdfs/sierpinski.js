export default `
float sierpinski(in vec3 p) {
    p.y += 0.3;
    float scale = 2.;
    const int iterations = 25;

    float s = sin(-45. * M_PI / 180.);
    float c = cos(-45. * M_PI / 180.);

    mat3 rotz = mat3(
        c, -s, 0.,
        s, c, 0.,
        0., 0., 1.
    );

    s = sin(30. * M_PI / 180.);
    c = cos(30. * M_PI / 180.);
    mat3 rotx = mat3(
        1., 0., 0.,
        0., c, -s,
        0., s, c
    );

    vec3 z = rotz * rotx * p;
    for(int i = 0; i < iterations; ++i) {
        if(z.x + z.z < 0.) z.xz = -z.zx;
        if(z.x + z.y < 0.) z.xy = -z.yx;
        if(z.y + z.z < 0.) z.zy = -z.yz;
        z = z * scale - (scale - 1.);
    }

    //Tiny spheres that will shrink at different zoom levels.
    //Iterations also need to increase to fill in gaps.
    return length(z) * pow(scale, -float(iterations)) - clamp(zoomScale * 2e-2, 1e-8, 3e-3);
}

float sdf(in vec3 p) {
    return sierpinski(p);
}


//See Tetrahedron technique https://iquilezles.org/www/articles/normalsSDF/normalsSDF.htm
//This function is used to estimate the gradient/surface normal.
vec3 gradient(in vec3 p) {
    float h = pixelScale * 0.5 * max(zoomScale / tanFov, 3e-4);
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
