export default `
    vec3 baseColor = vec3(0.9);
    vec3 color = vec3(0.);
    vec3 lightDirection = normalize(vec3(0.5, -2., -1.));
    vec3 lightPower = vec3(3.1, 2.1, 0.9);
    float t_, steps_;
    if(!intersectSdf(startPos, -vec4(lightDirection, 0.), 0.01, 100., t_, steps_)) {
        //Pure diffuse material, fairly simplistic
        color += directionLightEmit(lightDirection, lightPower, normal) * baseColor / (2. * M_PI);
    }

    lightDirection = normalize(vec3(0., 0.0, -1.));
    if(!intersectSdf(startPos, -vec4(lightDirection, 0.), 0.01, 100., t_, steps_)) {
        color += directionLightEmit(lightDirection, lightPower, normal) * baseColor / (2. * M_PI);
    }
    gl_FragColor =  vec4(ao * envMapColor + color, 1.);
`.trim()
