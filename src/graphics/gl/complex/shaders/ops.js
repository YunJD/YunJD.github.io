export default `
//Complex number operations
vec2 cmul(in vec2 a, in vec2 b) {
    return vec2(
        a.x * b.x - a.y * b.y,
        a.x * b.y + a.y * b.x
    );
}

vec2 cdiv(in vec2 a, in vec2 b) {
    return vec2(a.x * b.x + a.y * b.y, a.y * b.x - a.x * b.y) / (b.x * b.x + b.y * b.y);
}

float cabs2(in vec2 a) {
    return a.x * a.x + a.y * a.y;
}

float cabs(in vec2 a) {
    return sqrt(cabs2(a));
}

//Quaternions
vec4 qmul(in vec4 q1, in vec4 q2) {
    vec4 r;
    r.x = q1.x * q2.x - dot(q1.yzw, q2.yzw);
    r.yzw = q1.x * q2.yzw + q2.x * q1.yzw + cross(q1.yzw, q2.yzw);
    return r;
}

void qpow2(inout vec4 q) {
    q.x = q.x * q.x - dot(q.zyw, q.zyw);
    q.yzw = 2. * q.x * q.yzw;
}
`
