import * as T from 'three';
import stuff from 'stuff';
import raySphereMarchingShader from 'shaders/raySphereMarching.frag';
import sdfSnippets from 'snippets/sdf_snippets.jsx';

export default function() {
    let editor = ace.edit("editor");
    editor.setTheme("ace/theme/gruvbox");
    editor.getSession().setMode("ace/mode/glsl");
    editor.setValue(sdfSnippets, 1);
    editor.commands.addCommand({
        name: 'updateprogram',
        bindKey: {
            win: 'Ctrl-Enter', mac: 'Command-Enter'
        },
        exec: function() {
            updateProgram();
        }
    });

    let $view = $('#view');
    let $viewParent = $view.parent();

    let camera = new T.PerspectiveCamera(80, $viewParent.width() / $viewParent.height(), 0.1, 1000);
    let camR = 400,
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
        camR = T.Math.clamp(camR + amount, 0.2, 1500);
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
    let dragging = false;
    let mousePos;
    let pinchPos;
    $(window).on('blur', function(e) {
        dragging = false;
    });

    $view.on('mousedown', function(e) {
        if(e.which == 1) {
            dragging = true;
            mousePos = [e.pageX, e.pageY];
        }
        else {
            dragging = false;
        }
    });
    $view.on('touchstart', function(e) {
        if(e.touches.length == 1) {
            dragging = true;
            mousePos = [e.touches[0].pageX, e.touches[0].pageY];
        }
        else {
            //As soon as more than 1 finger is detected, stop dragging.
            dragging = false;
            //Pinching
            if(e.touches.length == 2) {
                e.preventDefault();
                pinchPos = e.touches;
            }
        }
    });

    $(window).on('mouseup', function(e) {
        dragging = false;
    });
    $(window).on('touchend', function(e) {
        dragging = false;
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
    $view.on('touchmove', function(e) {
        if(dragging) {
            e.preventDefault();
            let deltaX = (e.touches[0].pageX - mousePos[0]) / $viewParent.width();
            let deltaY = (e.touches[0].pageY - mousePos[1]) / $viewParent.height();
            rotatePhi(2 * Math.PI * deltaX);
            rotateTheta(-Math.PI * deltaY);
            mousePos = [e.touches[0].pageX, e.touches[0].pageY];
        }
        else if(e.touches.length == 2) {
            e.preventDefault();
            let oldScale = Math.sqrt(
                Math.pow(pinchPos[0].pageX - pinchPos[1].pageX, 2) 
                + Math.pow(pinchPos[0].pageY - pinchPos[1].pageY, 2)
            );
            let scale = Math.sqrt(
                Math.pow(e.touches[0].pageX - e.touches[1].pageX, 2) 
                + Math.pow(e.touches[0].pageY - e.touches[1].pageY, 2)
            );
            let delta = scale - oldScale; //Positive means fingers moved apart, negative means fingers moved together.
            //Define 1 change 'unit' as the fingers moving half the minimum screen extent. Tweak after experimentation.
            zoom(5 * Math.log(camR / 5 + 1) * (-delta * 2 / Math.min($view.height(), $view.width())));
        }
    });
    $view.on('mousewheel', function(e) {
        //Zoom slower as we paroach camR = 0;
        zoom(5 * Math.log(camR / 5 + 1) * (-e.originalEvent.wheelDelta / 120));
    });

    let marchPass = new stuff.gl.ComputeShaderPass({
        uniforms: {
            //Not to be confused with camera.far, this defines when to give up in case nothing was hit.
            far: {
                type: 'f',
                value: 1e6
            },
            relaxation: {
                type: 'f',
                value: 1.6
            },
            threshold: {
                type: 'f',
                value: 1e-2
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
        fragmentShader: raySphereMarchingShader().replace("float distanceProgram;", editor.getValue())
    }, $viewParent.width(), $viewParent.height());

    function updateProgram() {
        marchPass.material.fragmentShader = raySphereMarchingShader().replace("float distanceProgram;", editor.getValue());
        marchPass.material.needsUpdate = true;
        needsUpdate = true;
    }

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
            vec3 b1 = vec3(-100.);
            vec3 b2 = vec3(100.);

            void main() {
                vec4 color = texture2D(surfaceData, vUv);
                if(color.a != -1.) {
                    if(color.a == -2.) {
                        gl_FragColor = vec4(color.xyz, 1.);
                    }
                    else {
                        gl_FragColor = vec4(length(color.xyz) / 150.);
                    }
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
        $("#editor").height($("#editor").parent().height() - 10);
        editor.resize();

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
        setTimeout(() => {
            $("#fab-update").removeClass("mdc-fab--exited");
        }, 500);
    });
    $("#close-bottom-sheet").on('click', function() {
        $("#fab-update").addClass("mdc-fab--exited");
        $viewParent.removeClass('shrunk');
        $('#bottom-sheet').removeClass('visible');
        setTimeout(() => $("#fab-tune").removeClass("mdc-fab--exited"), 500);
    });
    $("#fab-update").on('click', updateProgram);
    $(window).on('keydown', function(e) {
        if(e.which == 13 && e.shiftKey && $('#bottom-sheet').hasClass('visible')) {
            e.preventDefault();
            updateProgram();
        }
        else if(e.which == 27) {
            e.preventDefault();
            if($('#bottom-sheet').hasClass('visible')) {
                $('#close-bottom-sheet').click();
                editor.blur();
            }
            else {
                $('#fab-tune').click();
                editor.focus();
            }
        }
    });
}
