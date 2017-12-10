import * as T from 'three';
import stuff from 'stuff';
import raySphereMarchingShader from 'shaders/raySphereMarching.frag';

export default function() {
    let $view = $('#view');
    let $viewParent = $view.parent();

    let camera = new T.PerspectiveCamera(80, $viewParent.width() / $viewParent.height(), 0.1, 1000);
    let camR = 200,
        camPhi = Math.PI * 0.5,
        camTheta = Math.PI * 0.5;
    let origin = new T.Vector3(0., 0., 0.);
    updateCamera();
    function setCameraPosition() {
        camera.position.set(
            camR * Math.cos(camPhi) * Math.sin(camTheta),
            camR * Math.cos(camTheta),
            camR * Math.sin(camPhi) * Math.sin(camTheta)
        );
    }
    function updateCamera() {
        setCameraPosition();
        camera.lookAt(origin);
        camera.updateMatrix();
        needsUpdate = true;
    }
    function zoom(amount) {
        camR = T.Math.clamp(camR + amount, 20, 1000);
        updateCamera();
    }
    function rotateTheta(amount) {
        camTheta = T.Math.clamp(camTheta + amount, 1e-2, Math.PI - 1e-2);
        updateCamera();
    }
    function rotatePhi(amount) {
        camPhi += amount;
        if(camPhi > 2 * Math.PI) {
            camPhi -= 2 * Math.PI;
        }
        else if(camPhi < 0.) {
            camPhi += 2 * Math.PI;
        }
        updateCamera();
    }
    $view.on('mousewheel', function(e) {
        zoom(20 * (-e.originalEvent.wheelDelta / 120));
    });
    let dragging = false;
    let mousePos;
    $view.on('mousedown', function(e) {
        if(e.which == 1) {
            dragging = true;
            mousePos = [e.pageX, e.pageY];
        }
    });
    $viewParent.on('blue', function(e) {
        dragging = false;
    });
    $(window).on('mouseup', function(e) {
        if(e.which == 1) {
            dragging = false;
        }
    });
    $view.on('mousemove', function(e) {
        if(dragging) {
            e.preventDefault();
            let deltaX = (e.pageX - mousePos[0]) / $viewParent.width();
            let deltaY = (e.pageY - mousePos[1]) / $viewParent.height();
            rotatePhi(2 * Math.PI * deltaX);
            rotateTheta(-Math.PI * deltaY);
            mousePos = [e.pageX, e.pageY];
        }
    });

    let marchPass = new stuff.gl.ComputeShaderPass({
        uniforms: {
            //Not to be confused with camera.far, this defines when to give up in case nothing was hit.
            far: {
                type: 'f',
                value: 1e3
            },
            threshold: {
                type: 'f',
                value: 1e-3
            },
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
        fragmentShader: raySphereMarchingShader({
            distanceProgram: `
                return max(
                    length(p) - 100.0,
                    -min(
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
            `
        })
    //}, $viewParent.width(), $viewParent.height(), null, $("#view")[0]);
    }, $viewParent.width(), $viewParent.height());

    let viewerPass = new stuff.gl.ComputeShaderPass({
        uniforms: {
            surfaceData: {
                type: 't',
                value: marchPass.texTarget.t.texture
            }
        },
        fragmentShader: `
            varying vec2 vUv;
            uniform sampler2D surfaceData;

            void main() {
                vec4 color = texture2D(surfaceData, vUv);
                if(color.a != -1.) {
                    gl_FragColor = vec4(abs(color.xyz) / 100., 1.);
                }
            }
        `
    //}, $viewParent.width(), $viewParent.height());
    }, $viewParent.width(), $viewParent.height(), null, $("#view")[0]);
    //Needs the same renderer in order to share data. Booo.
    marchPass.renderer.dispose();
    marchPass.renderer = viewerPass.renderer;

    let needsUpdate = true;

    function resize() {
        camera.aspect = $viewParent.width() / $viewParent.height();
        camera.updateProjectionMatrix();

        viewerPass.resize($viewParent.width(), $viewParent.height());

        marchPass.resize($viewParent.width(), $viewParent.height());
        marchPass.material.uniforms.invProjMat.value = new T.Matrix4().getInverse(camera.projectionMatrix);

        needsUpdate = true;
    }

    function draw() {
        //Easy way to take advantage of container transitions.
        if($view.width() != $viewParent.width() || $view.height() != $viewParent.height()) {
            resize();
        }
        if(needsUpdate) {
            needsUpdate = false;
            marchPass.execute();
            viewerPass.execute();
        }
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
    $('#fab-tune').on('click', function() {
        $(this).addClass('mdc-fab--exited');
        $viewParent.addClass('shrunk');
        $('#bottom-sheet').addClass('visible');
        //500ms delay while we wait for the bottom sheet to show up.
        setTimeout(() => $("#fab-update").removeClass("mdc-fab--exited"), 500);
    });
    $("#close-bottom-sheet").on('click', function() {
        $("#fab-update").addClass("mdc-fab--exited");
        $viewParent.removeClass('shrunk');
        $('#bottom-sheet').removeClass('visible');
        setTimeout(() => $("#fab-tune").removeClass("mdc-fab--exited"), 500);
    });
}
