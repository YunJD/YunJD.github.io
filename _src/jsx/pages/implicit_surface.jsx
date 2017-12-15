import {MDCTab, MDCTabFoundation} from '@material/tabs';
import {MDCTabBar, MDCTabBarFoundation} from '@material/tabs';
import TextField from 'rmwc/TextField';
import Slider from 'rmwc/Slider';
import * as T from 'three';
import stuff from 'stuff';
import raySphereMarchingShader from 'shaders/raySphereMarching.frag';
import sdfSnippets from 'snippets/sdf_snippets.jsx';
import React from 'react';
import ReactDOM from 'react-dom';

export default function() {
    MDCTabBar.attachTo($('#code-tab-bar')[0]);

    let settingsPanel;
    let $activePanel = $("#code");
    $('#code-tab-bar').find('.mdc-tab').on('click', function() {
        $activePanel.removeClass('active');
        $activePanel = $($(this).attr('href')).addClass('active');
        $("#editor").height($("#editor").parent().height());
        editor.resize();

        //Have to initialize here, otherwise some property of being hidden.
        if(!settingsPanel) {
            settingsPanel = ReactDOM.render(<Settings 
                 boundingBox={marchPass.material.uniforms.bounds.value}
                 camera={camera} 
                 onChangeBounds={updateBounds}
                 onChangeFov={updateCameraFov}/>,
            $("#settings-container")[0]);
        }
    });

    let editor = ace.edit('editor');
    editor.setTheme('ace/theme/solarized_dark');
    editor.getSession().setMode('ace/mode/glsl');
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

    let $viewParent = $('#view-container');

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
    function updateCameraFov(fov) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
        marchPass.material.uniforms.invProjMat.value.getInverse(camera.projectionMatrix);
        needsUpdate = true;
    }
    function updateBounds(which, dim, value) {
        let bounds = marchPass.material.uniforms.bounds.value;
        if(which == 0) {
            bounds[0][dim] = Math.min(value, bounds[1][dim]);
        }
        else {
            bounds[1][dim] = Math.max(value, bounds[0][dim] + 10);
        }
        needsUpdate = true;
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
    let marchPass = new stuff.gl.ComputeShaderPass({
        uniforms: {
            bounds: {
                type: 'v4v',
                value: [
                    new T.Vector3(-400, -400, -400),
                    new T.Vector3(400, 400, 400)
                ]
            },
            //Used to quit early.
            far: {
                type: 'f',
                value: 1e6
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
            cameraMat: {
                type: 'm4',
                value: camera.matrix
            }
        },
        //Use this FIRSTLINE comment to figure out where the distanceProgram starts
        fragmentShader: raySphereMarchingShader().replace("float distanceProgram;", '//FIRSTLINE\n' + editor.getValue())
    }, $viewParent.width(), $viewParent.height());

    function updateProgram() {
        editor.session.clearAnnotations();
        marchPass.material.fragmentShader = raySphereMarchingShader().replace("float distanceProgram;", '//FIRSTLINE\n' + editor.getValue());
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

            void main() {
                vec4 color = texture2D(surfaceData, vUv);
                if(color.a != -1.) {
                    if(color.a == -2.) {
                        gl_FragColor = vec4(color.xyz, 1.);
                    }
                    else {
                        gl_FragColor = vec4(color.xyz, 1.);
                    }
                }
            }
        `
    }, $viewParent.width(), $viewParent.height(), null, marchPass.renderer);

    let $view = $(viewerPass.renderer.domElement);
    $viewParent.append($view);

    let needsUpdate = true;

    function resize() {
        $("#editor").height($("#editor").parent().height());
        editor.resize();

        camera.aspect = $viewParent.width() / $viewParent.height();
        camera.updateProjectionMatrix();

        viewerPass.resize($viewParent.width(), $viewParent.height());

        marchPass.resize($viewParent.width(), $viewParent.height());
        marchPass.material.uniforms.invProjMat.value.getInverse(camera.projectionMatrix);

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

            //TODO: Move this into stuff.js
            let diagnostics = marchPass.material.program.diagnostics;
            if(diagnostics) {
                let log = diagnostics.fragmentShader.log;
                if(log.indexOf('ERROR') != -1) {
                    let lines = (diagnostics.fragmentShader.prefix + marchPass.material.fragmentShader).split('\n');
                    //Find the start of the distance program.
                    let i;
                    for(i = 0; i < lines.length; ++i) {
                        if(lines[i] == '//FIRSTLINE') {
                            break;
                        }
                    }
                    let annotations = [];
                    //Parse the error.
                    for(let error of log.split('\n')) {
                        if(!error || error.indexOf('ERROR') == -1) {
                            break;
                        }
                        let [column, row, code, text] = error.substring(7).split(':');
                        column = parseInt(column);
                        row = parseInt(row);
                        row -= i + 2;
                        annotations.push({
                            row, column,
                            text: code + ':' + text,
                            type: "error"
                        });
                    }
                    editor.session.setAnnotations(annotations);
                }
            }
            viewerPass.execute(true);
        }
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

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
        if(e.which == 13 && e.ctrlKey && $('#bottom-sheet').hasClass('visible')) {
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

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.changeFov = function(e) {
            this.props.onChangeFov(e.target.value);
            this.forceUpdate();
        }.bind(this);
        this.changeBounds = function(bound, dimension, e) {
            //Reverse
            this.props.onChangeBounds(bound, dimension, bound == 0 ? -e.target.value : e.target.value);
            this.forceUpdate();
        }.bind(this);
    }
    render() {
        return (
            <div>
                <p>Camera</p>
                <div className="mdc-typography--caption">FOV</div>
                <Slider displayMarkers discrete step="1" value={this.props.camera.fov} min={30} max={120} onChange={this.changeFov}/>

                <p>Scene</p>
                <div className="mdc-typography--caption">Bounding Box</div>
                <p>x: <strong>{this.props.boundingBox[0].x.toFixed(1)}, {this.props.boundingBox[1].x.toFixed(1)}</strong></p>
                <div dir="rtl">
                    <Slider step="0.5" value={-this.props.boundingBox[0].x} min={-500} max={500} onChange={this.changeBounds.bind(null, 0, 'x')}/>
                </div>
                <Slider step="0.5" value={this.props.boundingBox[1].x} min={-500} max={500} onChange={this.changeBounds.bind(null, 1, 'x')}/>

                <p>y: <strong>{this.props.boundingBox[0].y.toFixed(1)}, {this.props.boundingBox[1].y.toFixed(1)}</strong></p>
                <div dir="rtl">
                    <Slider step="0.5" value={-this.props.boundingBox[0].y} min={-500} max={500} onChange={this.changeBounds.bind(null, 0, 'y')}/>
                </div>
                <Slider step="0.5" value={this.props.boundingBox[1].y} min={-500} max={500} onChange={this.changeBounds.bind(null, 1, 'y')}/>

                <p>z: <strong>{this.props.boundingBox[0].z.toFixed(1)}, {this.props.boundingBox[1].z.toFixed(1)}</strong></p>
                <div dir="rtl">
                    <Slider step="0.5" value={-this.props.boundingBox[0].z} min={-500} max={500} onChange={this.changeBounds.bind(null, 0, 'z')}/>
                </div>
                <Slider step="0.5" value={this.props.boundingBox[1].z} min={-500} max={500} onChange={this.changeBounds.bind(null, 1, 'z')}/>
            </div>
        );
    }
}
