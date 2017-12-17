struct PointLight {
    vec3 position;
    vec3 intensity;
}

vec3 Le(in PointLight light, in vec3 p, in vec3 d) {
    vec3 pointToPoint = light.position - p;
    return light.intensity / (4. * 3.141592 * dot(pointToPoint, pointToPoint));
}
