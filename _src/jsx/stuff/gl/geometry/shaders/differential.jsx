export default () => `
//Not really sure of a better way to do this. A macro is used because:
//  A: This way, a new gradient function does not need to be defined for every new function.
//  B: How else can callbacks be performed in GLSL?
//I would love to know better auto-differentiation methods for WebGL.  For now, if the gradient is known, then it's
//recommended that this function be replaced by an analytical gradient implementation.
#define NUM_GRAD3(fn, p, delta) \
    numDiff(\
        vec3(\
            fn(vec3(p.x + delta, p.y, p.z)),\
            fn(vec3(p.x, p.y + delta, p.z)),\
            fn(vec3(p.x, p.y, p.z + delta))\
        ),\
        vec3(\
            fn(vec3(p.x - delta, p.y, p.z)),\
            fn(vec3(p.x, p.y - delta, p.z)),\
            fn(vec3(p.x, p.y, p.z - delta))\
        ),\
        delta\
    )

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
