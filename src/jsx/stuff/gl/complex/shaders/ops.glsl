//Bunch of complex ops
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
