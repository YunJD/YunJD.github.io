export default () => `
#define NUM_GRAD3 numDiff(vec3(FN(gradP + gradD.yxx), FN(gradP + gradD.xyx), FN(gradP + gradD.xxy)), vec3(FN(gradP - gradD.yxx), FN(gradP - gradD.xyx), FN(gradP - gradD.xxy)), gradD.y)

float numDiff(float deltaPositive, float deltaNeg, float delta) {
    return (deltaPositive - deltaNeg) / (2. * delta);
}

vec2 numDiff(in vec2 deltaPositive, in vec2 deltaNegative, float delta) {
    return (deltaPositive - deltaNegative) / (2. * delta);
}

vec3 numDiff(in vec3 deltaPositive, in vec3 deltaNegative, float delta) {
    return (deltaPositive - deltaNegative) / (2. * delta);
}

vec4 numDiff(in vec4 deltaPositive, in vec4 deltaNegative, float delta) {
    return (deltaPositive - deltaNegative) / (2. * delta);
}
`;
