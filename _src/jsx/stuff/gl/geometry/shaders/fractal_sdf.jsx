export default () => `
#define ITERATIONS 16
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

float mandelbulb(in vec4 p, float power, float phaseShift) {
    vec3 pos = p.xzy;
    vec3 z = pos;

    float dr = 1.;
    float r = 0.;

    for(int i = 0; i < ITERATIONS; ++i) {
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

float julia3D(in vec4 p, in vec3 c, float power, float phaseShift) {
    vec3 pos = p.xzy;
    vec3 z = pos;

    float dr = 1.;
    float r = 0.;

    for(int i = 0; i < ITERATIONS; ++i) {
        r = length(z);
        if(r > 2.) break;

        //Convert to polar coordinates
        float theta = acos(z.z / r) + phaseShift;
        float phi = atan(z.y, z.x);
        dr = power * pow(r, power - 1.) * dr;

        float zr = pow(r, power);
        theta *= power;
        phi *= power;

        //Convert back to cartesian coordinates
        float sinTheta = sin(theta);
        z = zr * vec3(
            sinTheta * cos(phi), sinTheta * sin(phi), cos(theta)
        ) + c;
    }
    return 0.25 * log(r) * r / dr;
}
`;
