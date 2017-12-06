import * as T from 'three';
import stuff from 'stuff';
import raySphereMarchingShader from 'shaders/raySphereMarching.frag';

export default function() {
    let $view = $('#view');

    let camera = new T.PerspectiveCamera(120, $(window).width() / $(window).height(), 0.1, 1000);
    camera.translateZ(50);
    camera.updateMatrix();

    let marchPass = new stuff.gl.ComputeShaderPass({
        uniforms: {
            //Change the meaning of the far / near planes, far being a distance cutoff and near being the minimum hit threshold.
            far: {
                type: 'f', 
                value: camera.far
            },
            near: {
                type: 'f',
                value: camera.near
            }
            //Must not use the name same names as any of the camera matrices, as that would override the orthographic camera matrix from the compute shader!
            invProjMat: {
                type: 'm4',
                value: new T.Matrix4().getInverse(camera.projectionMatrix)
            },
            mat: {
                type: 'm4',
                value: camera.matrix
            }
        },
        fragmentShader: raySphereMarchingShader(`
            return length(p) - 1.
        `)
    }, $(window).width(), $(window).height());

    let viewerPass = new stuff.gl.ComputeShaderPass({
        uniforms: {
        },
        fragmentShader: `
            void main() {
                gl_FragColor = vec4(0.5);
            }
        `
    }, $(window).width(), $(window).height(), null, $("#view")[0]);
    let hasUpdate = true;

    function resize() {
        marchPass.resize($(window).width(), $(window).height());
        viewerPass.resize($(window).width(), $(window).height());
        camera.aspect = $(window).width() / $(window).height();
        camera.updateProjectionMatrix();
    }

    $(window).on('resize', resize);

    function draw() {
        if(hasUpdate) {
            marchPass.execute();
            viewerPass.execute();
            hasUpdate = false;
        }
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
}
