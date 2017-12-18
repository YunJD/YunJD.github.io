//This is the initial program.

export default `
uniform float time;
//Make sure to keep the function signatures the same of every function here!

//Edit this to see different shapes.
float sdf(in vec3 p) {
    float sphereDist = (length(p) - 0.2);
    float displacement = sin(p.x * 50. + time * 0.001) * sin(p.z * 50. + time * 0.001) * sin(p.y * 50.);
    float plane = p.y + 0.6;
    return min(
        sphereDist * 0.3 + displacement * 0.03,
        plane
    );
}

//Not really sure of a better way to do this. A macro is used because:
//  A: This way, a new gradient function does not need to be defined for every new FN.
//  B: How else can callbacks be performed in GLSL?
//I would love to know better auto-differentiation methods for WebGL.  For now, if the gradient is known, then it's
//recommended that this function be replaced by an analytical gradient implementation.
#define FN sdf
vec3 gradient(in vec4 p, float t) {
    //I couldn't make the functional macro definition work. I a dumb dumb.
    vec2 gradD = vec2(0., 5e-4);
    vec3 gradP = p.xyz;

    //Numerical gradient macro.
    return NUM_GRAD3;
}
#undef FN

float distance(in vec4 p, float t, int i) {
    //p: the point calculated by rp + t * rd
    //rp: Ray start position.
    //rd: Ray direction.
    return sdf(p.xyz);
}

`.trim()
