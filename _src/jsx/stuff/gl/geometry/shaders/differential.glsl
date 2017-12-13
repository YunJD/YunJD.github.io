float numericalGradient(float deltaPositive, float deltaNeg, float delta) {
    return (deltaPositive - deltaNeg) / (2. * delta);
}

vec2 numericalGradient(in vec2 deltaPositive, in vec2 deltaNegative, in vec2 delta) {
    return (deltaPositive - deltaNegative) / delta;
}

vec3 numericalGradient(in vec3 deltaPositive, in vec3 deltaNegative, in vec3 delta) {
    return (deltaPositive - deltaNegative) / delta;
}

vec4 numericalGradient(in vec4 deltaPositive, in vec4 deltaNegative, in vec4 delta) {
    return (deltaPositive - deltaNegative) / delta;
}
