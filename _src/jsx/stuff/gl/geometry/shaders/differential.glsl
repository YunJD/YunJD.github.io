float numericalGradient(float deltaPositive, float deltaNeg, float delta) {
    return (deltaPositive - deltaNeg) / (2. * delta);
}

vec2 numericalGradient(in vec2 deltaPositive, in vec2 deltaNegative, float delta) {
    return (deltaPositive - deltaNegative) / (2. * delta);
}

vec3 numericalGradient(in vec3 deltaPositive, in vec3 deltaNegative, float delta) {
    return (deltaPositive - deltaNegative) / (2. * delta);
}

vec4 numericalGradient(in vec4 deltaPositive, in vec4 deltaNegative, float delta) {
    return (deltaPositive - deltaNegative) / (2. * delta);
}
