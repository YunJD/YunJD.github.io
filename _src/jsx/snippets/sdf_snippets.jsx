//The glsl loader will remove white-space and comments.
export default `
//Define the GLSL distance function that is used by the ray-sphere-marching algorithm.
float sixFunkySpheres(in vec4 p) {
    return 2.5 * sin(p.x/4.) + cos(p.y/4.) + sin(p.z/4.) + max(
        length(p) - 140.0,
        min(
            (length(vec3(p.x - 125., p.y, p.z)) - 100.),
            min(
                (length(vec3(p.x + 125., p.y, p.z)) - 100.),
                min(
                    (length(vec3(p.x, p.y + 125., p.z)) - 100.),
                    min(
                        (length(vec3(p.x, p.y, p.z - 125.)) - 100.),
                        (length(vec3(p.x, p.y, p.z + 125.)) - 100.)
                    )
                )
            )
        )
    );
}

//Make sure to keep the function signature the same!
float distance(in vec4 p, float t, int i) {
    //p: the point calculated by rp + t * rd
    //rp: Ray start position.
    //rd: Ray direction.
    return sixFunkySpheres(p);
}

vec3 gradient(in vec4 p, float t, int i) {
    vec4 delta = p;
    vec3 gPos;
    vec3 gNeg;

    //Unfortunately I don't know how to pass a function as an argument, so I'm forced to put the computations here.

    //Numerically compute the positive direction deltas
    delta.x += 5e-4;
    gPos.x = distance(delta, t, i);
    delta.x = p.x; delta.y += 5e-4;
    gPos.y = distance(delta, t, i);
    delta.y = p.y; delta.z += 5e-4;
    gPos.z = distance(delta, t, i);
    delta.z = p.z;

    //Numerically compute the negative direction deltas
    delta.x -= 5e-4;
    gNeg.x = distance(delta, t, i);
    delta.x = p.x; delta.y -= 5e-4;
    gNeg.y = distance(delta, t, i);
    delta.y = p.y; delta.z -= 5e-4;
    gNeg.z = distance(delta, t, i);

    return numericalGradient(gPos, gNeg, 5e-4);
}
`.trim()
