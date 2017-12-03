import * as T from 'three';
import stuff from 'stuff';

export default function() {
    let $view = $('#view');

    let camera = new T.PerspectiveCamera(100, $(window).width() / $(window).height(), 0.1, 1000);
    //Pass the camera's projection matrix into fragment shader to do ray marching calculations.
    /*
    let implSurfPass = new stuff.gl.ComputeShaderPass({
    }, $(window).width(), $(window).width());
    */

    let viewerPass = new stuff.gl.ComputeShaderPass({
        uniforms: {
        },
        fragmentShader: `
            void main() {
                gl_FragColor = vec4(1., 0.5, 0.6, 1.);
            }
        `
    }, $(window).width(), $(document).height(), null, $("#view")[0]);

    let renderers = [];
    function resize() {
        //implSurfPass.resize($(window).width(), $(window).height());
        viewerPass.resize($(window).width(), $(window).height());
        camera.aspect = $(window).width() / $(window).height();
        camera.updateProjectionMatrix;
    }

    $(window).on('resize', resize);

    function draw() {
        viewerPass.execute();
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
}
