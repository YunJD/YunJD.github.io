export default `
    if(changeInSteps(data) > 3.) {
        gl_FragColor = vec4(vec3(0.), 1.);
        return;
    }
    vec4 toonShadeN = vec4(normalize(gradient(startPos.xyz, 5.)), 0.);
    vec3 baseColor = vec3(0.9);
    vec3 color = vec3(0.);
    vec3 lightDirection = normalize(vec3(0.5, -2., -1.));
    vec3 lightPower = vec3(3., 0.5, 0.7);
    float t_, steps_;
    if(!intersectSdf(startPos, -vec4(lightDirection, 0.), 0.01, 100., t_, steps_)) {
        //Pure diffuse material, fairly simplistic
        color += directionLightEmit(lightDirection, lightPower, toonShadeN) * baseColor / (2. * M_PI);
    }
    //For toons, the shadow color doesn't have to be black
    else {
        color = vec3(0., 0.15, 0.2);
    }

    lightDirection = normalize(vec3(0., 0.0, -1.));
    lightPower = vec3(3., 2.5, 0.7);
    if(!intersectSdf(startPos, -vec4(lightDirection, 0.), 0.01, 100., t_, steps_)) {
        color += directionLightEmit(lightDirection, lightPower, toonShadeN) * baseColor / (2. * M_PI);
    }
    else {
        color = vec3(0., 0.15, 0.2);
    }
    gl_FragColor =  vec4(envMapColor * 0.25 + color, 1.);
`.trim()
