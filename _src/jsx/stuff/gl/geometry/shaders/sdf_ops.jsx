export default () => `
vec2 opUnion(in vec2 a, in vec2 b) {
    return a.x <= b.x ? a : b;
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0., 1.);
    return mix(b, a, h) - k * h * (1. - h);
}
`;
