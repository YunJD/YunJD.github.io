import complexOps from 'stuff/gl/complex/shaders/ops.jsx';
import intersect from 'stuff/gl/geometry/shaders/intersect.jsx';
import differential from 'stuff/gl/geometry/shaders/differential.jsx';
import camera from 'stuff/gl/camera/shaders/camera.jsx';
import sdfOps from 'stuff/gl/geometry/shaders/sdf_ops.jsx';
import sdfMarcher from 'stuff/gl/geometry/shaders/sdf_marcher.jsx';
import fractalSdf from 'stuff/gl/geometry/shaders/fractal_sdf.jsx';

export default ({maxSteps, sdf, distanceProgram}) => `
precision highp float;
precision highp int;
${complexOps()}
${sdfOps()}
${intersect()}
${differential()}
${camera()}
${fractalSdf()}

uniform vec3 bounds[2];
varying vec2 vUv;

${distanceProgram}

//Include this here since the shader needs to have the sdf defined before calling.
${sdfMarcher({ maxSteps, sdf })}

void main() {
    gl_FragColor = vec4(-1.);

    vec4 rayPos = getCameraPos();
    vec4 rayDir = getCameraRay(vUv);

    float bbmin, bbmax;
    if(intersectAABB(bounds[0], bounds[1], rayPos.xyz, rayDir.xyz, bbmin, bbmax)) {
        float t;
        if(intersectImplicit(rayPos, rayDir, bbmin, bbmax, t)) {
            gl_FragColor = vec4(normalize(gradient(rayPos + t * rayDir, t, getCameraRay(vec2(1., 0.)).x)), t);
        }
    }
}
`;
