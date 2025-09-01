export default `
//A couple constructive solid geometry operations for signed distance functions
float sdfUnion(float a, float b) {
    return min(a, b);
}

float sdfMin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0., 1.);
    return mix(b, a, h) - k * h * (1. - h);
}
`
