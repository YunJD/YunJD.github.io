//The glsl loader will remove white-space and comments.
export default `
float funShape(in vec4 p, in vec4 rp, in vec4 rd) {
    return max(
        length(p) - 140.0,
        min(
            (length(vec3(p.x - 125., p.y, p.z)) - 100.),
            min(
                (length(vec3(p.x + 125., p.y, p.z)) - 100.),
                min(
                    (length(vec3(p.x, p.y - 125., p.z)) - 100.),
                    min(
                        (length(vec3(p.x, p.y + 125., p.z)) - 100.),
                        min(
                            (length(vec3(p.x, p.y, p.z - 125.)) - 100.),
                            (length(vec3(p.x, p.y, p.z + 125.)) - 100.)
                        )
                    )
                )
            )
        )
    );
}

//Make sure to keep the function signature the same!
float distance(in vec4 p, in vec4 rp, in vec4 rd) {
    //p: the point calculated by rp + t * rd
    //rp: Ray start position.
    //rd: Ray direction.
    return funShape(p, rp, rd);
}
`.trim()
