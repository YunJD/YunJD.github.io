//The glsl loader will remove white-space and comments.
export default `
//Define the GLSL distance function that is used by the ray-sphere-marching algorithm.
float sixFunkySpheres(in vec4 p, in vec4 rp, in vec4 rd) {
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
float distance(in vec4 p, in vec4 rp, in vec4 rd, int i) {
    //p: the point calculated by rp + t * rd
    //rp: Ray start position.
    //rd: Ray direction.
    return sixFunkySpheres(p, rp, rd);
}
`.trim()
