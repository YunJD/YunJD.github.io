export default () => `
#define JULIA_STEPS 11
float julia4D(in vec4 p, in vec4 c) {
    vec4 z = p;
    vec4 grad = vec4(1., 0., 0., 0.);

    float mz2 = dot(z, z);
    float md2 = 1.;

    for(int i = 0; i < JULIA_STEPS; ++i) {
        md2 *= 4. * mz2;
        z = vec4(z.x * z.x - dot(z.yzw, z.yzw), 2.0 * z.x * z.yzw) + c;
        mz2 = dot(z, z);

        if(mz2 > 4.) {
            break;
        }
    }

    return 0.25 * sqrt(mz2 / md2) * log(mz2);
}
`;
