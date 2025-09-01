export default `
    vec4 data = texture2D(surfaceData, vUv);
    if(data.w == -1.) {
        //Quick and easy outline effect.
        float toonOutlineDist = 5. * pixelScale;
        vec4 nearbyLeft = texture2D(surfaceData, vUv + vec2(-toonOutlineDist, 0.));
        vec4 nearbyRight = texture2D(surfaceData, vUv + vec2(toonOutlineDist, 0.));
        vec4 nearbyTop = texture2D(surfaceData, vUv + vec2(0., toonOutlineDist));
        vec4 nearbyBottom = texture2D(surfaceData, vUv + vec2(0., -toonOutlineDist));
        
        if(nearbyRight.w != -1. || nearbyTop.w != -1. || nearbyLeft.w != -1. || nearbyBottom.w != -1.) {
            gl_FragColor = vec4(vec3(0., 0., 0.), 1.);
        }
        return;
    }
    //Simple trick of changing the adaptive intersection threshold together with increasing this value can affect
    //interior black detailing.
    if(data.x >= 30.) {
        gl_FragColor = vec4(vec3(0.), 1.);
        return;
    }
    vec4 rayPos = getCameraPos();
    vec4 rayDir = getCameraRay(vUv);
    vec4 startPos = rayPos + data.w * rayDir;
    vec4 normal = vec4(normalize(gradient(startPos.xyz)), 0.);
    
    normal *= dot(rayDir, normal) < 0. ? 1. : -1.;

    gl_FragColor = 0.5 * vec4(cos(3. * normal.x), sin(normal.y), cos(normal.z), 1.) + 0.5;
`.trim()
