export default () => `
float julia4D(in vec4 p, in vec4 c) {
    vec4 z = p;

    float mz2 = dot(z, z);
    float md2 = 1.;

    for(int i = 0; i < 11; ++i) {
        md2 *= 4. * mz2;
        z = vec4(z.x * z.x - dot(z.yzw, z.yzw), 2.0 * z.x * z.yzw) + c;
        mz2 = dot(z, z);

        if(mz2 > 4.) {
            break;
        }
    }

    return 0.25 * sqrt(mz2 / md2) * log(mz2);
}

vec4 julia4DGrad(in vec4 p, in vec4 c) {
    vec4 z = p;
    vec4 dzr = vec4(1., 0., 0., 0.);
    vec4 dzi = vec4(0., 1., 0., 0.);
    vec4 dzj = vec4(0., 0., 1., 0.);
    vec4 dzk = vec4(0., 0., 0., 1.);

    for(int i = 0; i < 11; ++i) {
        vec4 mz = vec4(z.x, -z.y, -z.z, -z.w);
        dzr = vec4(dot(mz, dzr), z.x * dzr.yzw + dzr.x * z.yzw);
        dzi = vec4(dot(mz, dzi), z.x * dzi.yzw + dzi.x * z.yzw);
        dzj = vec4(dot(mz, dzj), z.x * dzj.yzw + dzj.x * z.yzw);
        dzk = vec4(dot(mz, dzk), z.x * dzk.yzw + dzk.x * z.yzw);

        z = vec4( dot(z, mz), 2.0 * z.x * z.yzw ) + c;

        if(dot(z, z) > 4.) {
            break;
        }
    }
    return vec4(
        dot(z, dzr),
        dot(z, dzi),
        dot(z, dzj),
        dot(z, dzk) //In case we slice differently
    );
}
`;
