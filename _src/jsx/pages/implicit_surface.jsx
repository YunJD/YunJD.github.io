import {ChromePicker} from 'react-color';
import {MDCTab, MDCTabFoundation, MDCTabBar, MDCTabBarFoundation} from '@material/tabs';
import {MDCRipple, MDCRippleFoundation, util} from '@material/ripple';
import TextField from 'rmwc/TextField';
import Slider from 'rmwc/Slider';
import IconToggle from 'rmwc/IconToggle';
import * as T from 'three';
import stuff from 'stuff';
import raySphereMarchingShader from 'shaders/raySphereMarching.jsx';
import raySphereLightingShader from 'shaders/raySphereLighting.jsx';
import sdfSnippets from 'snippets/sdf_snippets.jsx';
import React from 'react';
import ReactDOM from 'react-dom';

export default function() {
    let needsUpdate = true;

    let aoParams = {
        sampleDistance: 0.2,
        nSamples: 7
    };
    let lightingParams = {
        maxSteps: 150,
        sdf: 'distance'
    };

    let tabBar = MDCTabBar.attachTo($('#code-tab-bar')[0]);
    //Blegh, there's no documentation on toolbar text links...what?
    tabBar.tabs[0].destroy();
    MDCRipple.attachTo($("#code-tab-bar").children()[0]);

    let fabTop = $("#fab-tune").offset().top;
    let fabBottom = $(window).height() - fabTop - $("#fab-tune").height();
    let fabEvenSpacing = fabTop - fabBottom;

    let $activePanel = $("#lighting");
    $('#code-tab-bar').find('.mdc-tab').on('click', function(e) {
        if($(this).attr('href').indexOf('#') == -1) {
            return;
        }

        $activePanel.removeClass('active');
        $activePanel = $($(this).attr('href')).addClass('active');
        $("#editor").height($("#editor").parent().height());
        editor.resize();

    });

    let editor = ace.edit('editor');
    editor.$blockScrolling = Infinity;
    editor.setShowPrintMargin(false);
    editor.setOption('highlightActiveLine', false);
    editor.renderer.setScrollMargin(16, 16);
    editor.setTheme('ace/theme/dracula');
    editor.getSession().setMode('ace/mode/glsl');
    editor.setValue(sdfSnippets.mandelbulb.code, 1);
    editor.gotoLine(1);
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

    let camera = new T.PerspectiveCamera(80, $viewParent.width() / $viewParent.height(), 1., 1000); //By using near as 1., it does not at all affect the fov.
    let camR = 5,
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
    function updateLighting(type, colorVec) {
        viewerPass.material.uniforms[type].value.copy(colorVec);
        needsUpdate = true;
    }
    function updateAO(settings) {
        Object.assign(aoParams, settings);
        updateProgram();
    }
    function updateBounds(which, dim, value) {
        let bounds = marchPass.material.uniforms.bounds.value;
        if(which == 0) {
            bounds[0][dim] = Math.min(value, bounds[1][dim] - 0.01);
        }
        else {
            bounds[1][dim] = Math.max(value, bounds[0][dim] + 0.01);
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
        camR = T.Math.clamp(camR + amount, 0.01, 50);
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
    function updateTime(value) {
        marchPass.material.uniforms.time.value = value;
        needsUpdate = true;
    }
    let marchPass = new stuff.gl.ComputeShaderPass({
        uniforms: {
            time: {
                type: 'f',
                value: 0.
            },
            bounds: {
                type: 'v4v',
                value: [
                    new T.Vector3(-3, -3, -3),
                    new T.Vector3(3, 3, 3)
                ]
            },
            //Used to quit early. Kinda useless.
            far: {
                type: 'f',
                value: 1e5
            },
            threshold: {
                type: 'f',
                value: 3e-4
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
        fragmentShader: raySphereMarchingShader(Object.assign({
            maxSteps: 150,
            sdf: 'distance',
            distanceProgram: `//FIRSTLINE\n${editor.getValue()}`
        }, aoParams))
    }, $viewParent.width(), $viewParent.height());

    let envTextureLoader = new T.TextureLoader();
    let lightingPass = new stuff.gl.ComputeShaderPass({
        uniforms: {
            time: marchPass.material.uniforms.time,
            invProjMat: marchPass.material.uniforms.invProjMat,
            cameraMat: marchPass.material.uniforms.cameraMat,
            far: marchPass.material.uniforms.far,
            threshold: marchPass.material.uniforms.threshold,
            surfaceData: {
                type: 't',
                value: marchPass.texTarget.t.texture
            },
            envMap: {
                type: 't',
                value: envTextureLoader.load("/images/ibl/arches-env.png")
            }
        },
        fragmentShader: raySphereLightingShader(Object.assign({
            distanceProgram: editor.getValue()
        }, lightingParams, aoParams))
    }, $viewParent.width(), $viewParent.height(), null, marchPass.renderer);

    lightingPass.material.uniforms.envMap.value.magFilter = T.LinearFilter;
    lightingPass.material.uniforms.envMap.value.minFilter = T.LinearFilter;
    function updateEnvMap(img, label) {
        lightingPass.material.uniforms.envMap.value.dispose()
        lightingPass.material.uniforms.envMap.value = envTextureLoader.load(`/images/ibl/${img}`);
        lightingPass.material.uniforms.envMap.value.magFilter = T.LinearFilter;
        lightingPass.material.uniforms.envMap.value.minFilter = T.LinearFilter;
        needsUpdate = true;
    }

    let viewerPass = new stuff.gl.ComputeShaderPass({
        uniforms: {
            surfaceData: {
                type: 't',
                value: marchPass.texTarget.t.texture
            },
            lighting: {
                type: 't',
                value: lightingPass.texTarget.t.texture
            },
            background: {
                type: 'v3',
                value: new T.Vector3(0.95, 0.95, 0.95)
            }
        },
        fragmentShader: `
            precision highp float;
            precision highp int;
            varying vec2 vUv;
            uniform sampler2D surfaceData;
            uniform sampler2D lighting;
            uniform vec3 background;

            void main() {
                //float theta = (1. - vUv.y) * 3.1415926535;
                //float phi = vUv.x * 2. * 3.1415926535;
                //gl_FragColor = abs(vec4(
                //    cos(phi) * sin(theta),
                //    cos(theta),
                //    sin(phi) * sin(theta),
                //1.));
                //return;
                gl_FragColor = vec4(background, 1.);
                vec4 surface = texture2D(surfaceData, vUv);
                vec4 lightingData = texture2D(lighting, vUv);

                if(surface.a != -1.) {
                    if(surface.a == -2.) {
                        gl_FragColor = vec4(surface.xyz, 1.);
                    }
                    else {
                        gl_FragColor = lightingData;
                    }
                }
            }
        `
    }, $viewParent.width(), $viewParent.height(), null, marchPass.renderer);
    //}, 360, 180);

    let $view = $(marchPass.renderer.domElement);
    $viewParent.append($view);
    //$viewParent.append(viewerPass.renderer.domElement);


    function updateProgram() {
        editor.session.clearAnnotations();
        diagnostics = undefined;
        let distanceProgram = `//FIRSTLINE\n${editor.getValue()}`;

        marchPass.material.fragmentShader = raySphereMarchingShader(Object.assign({
            maxSteps: 150,
            sdf: 'distance',
            distanceProgram
        }, aoParams));
        marchPass.material.needsUpdate = true;

        lightingPass.material.fragmentShader = raySphereLightingShader(Object.assign({
            distanceProgram
        }, lightingParams, aoParams));
        lightingPass.material.needsUpdate = true;
        needsUpdate = true;
    }


    function resize() {
        $("#editor").height($("#editor").parent().height());
        editor.resize();

        camera.aspect = $viewParent.width() / $viewParent.height();
        camera.updateProjectionMatrix();

        viewerPass.resize($viewParent.width(), $viewParent.height());

        marchPass.resize($viewParent.width(), $viewParent.height());
        marchPass.material.uniforms.invProjMat.value.getInverse(camera.projectionMatrix);

        lightingPass.resize($viewParent.width(), $viewParent.height());

        needsUpdate = true;
    }

    let diagnostics;
    function draw() {
        if(!diagnostics) {
            //Easy way to take advantage of container transitions.
            if($view.width() != $viewParent.width() || $view.height() != $viewParent.height()) {
                resize();
            }
            if(needsUpdate) {
                marchPass.execute();
                lightingPass.execute();

                //TODO: Move this into stuff.js
                diagnostics = marchPass.material.program.diagnostics || lightingPass.diagnostics;
                if(diagnostics) {
                    let log = diagnostics.fragmentShader.log;
                    if(log.indexOf('ERROR') != -1) {
                        let prefixLines = diagnostics.fragmentShader.prefix.split('\n');
                        let lines = marchPass.material.fragmentShader.split('\n');

                        //Find the start of the distance program.
                        let i;
                        for(i = 0; i < lines.length; ++i) {
                            if(lines[i] == '//FIRSTLINE') {
                                break;
                            }
                        }
                        i += prefixLines.length;

                        let annotations = [];
                        //Parse the error.
                        for(let error of log.split('\n')) {
                            if(!error || error.indexOf('ERROR') == -1) {
                                break;
                            }
                            let [column, row, code, text] = error.substring(7).split(':');
                            column = parseInt(column);
                            row = parseInt(row);
                            row -= i + 1;
                            annotations.push({
                                row: T.Math.clamp(row, 0, editor.session.getLength() - 1), column,
                                text: code + ':' + text,
                                type: "error"
                            });
                            if(row < 0 || row >= editor.session.getLength()) {
                                annotations.push({
                                    row: editor.session.getLength() - 1, 
                                    column: 0,
                                    text: "This error was detected but occurred outside the distance shader section. Things such as redefinition of variables, removing the functions distance or gradient, or changing their function signatures could have caused this. If you think this is a genuine error, feel free to tell me all about it on Github.",
                                    type: "error"
                                });
                            }
                        }
                        editor.session.setAnnotations(annotations);
                    }
                }
                viewerPass.execute(true);
            }
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
            zoom(Math.log(camR / 0.5 + 1) * (-delta * 2 / Math.min($view.height(), $view.width())));
        }
    });
    $view.on('mousewheel', function(e) {
        //Zoom slower as we paroach camR = 0;
        zoom(Math.log(camR / 5 + 1) * (-e.originalEvent.wheelDelta / 120));
    });

    let fabSwitchTimeout;
    $('#fab-tune').on('click', function() {
        clearTimeout(fabSwitchTimeout);
        $(this).addClass('mdc-fab--exited');
        $viewParent.addClass('shrunk');
        $('#bottom-sheet').addClass('visible');
        //500ms delay while we wait for the bottom sheet to show up.
        fabSwitchTimeout = setTimeout(() => {
            $("#fab-update").removeClass("mdc-fab--exited");
        }, 250);
    });
    $("#close-bottom-sheet").on('click', function() {
        clearTimeout(fabSwitchTimeout);
        $("#fab-update").addClass("mdc-fab--exited");
        $viewParent.removeClass('shrunk');
        $('#bottom-sheet').removeClass('visible');
        fabSwitchTimeout = setTimeout(() => $("#fab-tune").removeClass("mdc-fab--exited"), 250);
    });
    $("#fab-update").on('click', updateProgram);
    $(window).on('keydown', function(e) {
        if(e.which == 13 && e.ctrlKey && $('#bottom-sheet').hasClass('visible')) {
            e.preventDefault();
            updateProgram();
        }
        else if(e.which == 27 && e.shiftKey) {
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
    $("#show-gallery").on('click', function() {
        $("#gallery").addClass('visible');
    });
    $("#close-gallery").on('click', function() {
        $("#gallery").removeClass('visible');
    });

    ReactDOM.render(<GalleryTiles snippets={sdfSnippets} onSelect={function(key) {
        let snippet = sdfSnippets[key];

        editor.setValue(snippet.code, 1);

        updateAO(snippet.aoParams || {
            sampleDistance: 0.2,
            nSamples: 7
        });

        updateEnvMap(snippet.envMap || 'arches-env.png');

        updateProgram();

        $("#gallery").removeClass('visible');
    }}/>,
        $("#gallery-tiles")[0]
    ); 
    ReactDOM.render(<PlayerControl 
         onUpdateTime={updateTime}
         time={marchPass.material.uniforms.time} />,
        $("#player-control")[0]
    );
    ReactDOM.render(<Settings 
         boundingBox={marchPass.material.uniforms.bounds.value}
         camera={camera} 
         onChangeBounds={updateBounds}
         onChangeFov={updateCameraFov}/>,
    $("#settings-container")[0]);

    ReactDOM.render(<Lighting
         aoParams={aoParams}
         lightingParams={viewerPass.material.uniforms}
         onUpdateLighting={updateLighting}
         onChangeEnvMap={updateEnvMap}
         onUpdateAO={updateAO}/>,
    $("#lighting-container")[0]);
}

class Lighting extends React.Component {
    constructor(props) {
        super(props);
        this.changeAOSamples = function(e) {
            this.props.onUpdateAO({
                nSamples: e.target.value
            });
            this.forceUpdate();
        }.bind(this);
        this.changeAODistance = function(e) {
            this.props.onUpdateAO({
                sampleDistance: e.target.value
            });
            this.forceUpdate();
        }.bind(this);
        this.changeLighting = function(which, color, e) {
            this.props.onUpdateLighting(which, new T.Vector3(
                color.rgb.r / 255,
                color.rgb.g / 255,
                color.rgb.b / 255
            ));
        }.bind(this);
    }
    render() {
        let bgColor = this.props.lightingParams.background.value;
        bgColor = { r: bgColor.x * 255, g: bgColor.y * 255, b: bgColor.z * 255 };
        return (
            <div>
                <p>Ambient Occlusion</p>
                <div className="mdc-typography--caption">Number of samples ({this.props.aoParams.nSamples.toLocaleString()})</div>
                <Slider discrete step="1" value={this.props.aoParams.nSamples} min={0} max={50} onChange={this.changeAOSamples}/>
                <div className="mdc-typography--caption">Distance ({this.props.aoParams.sampleDistance.toFixed(2)})</div>
                <Slider step={0.01} value={this.props.aoParams.sampleDistance} min={0.05} max={2} onChange={this.changeAODistance}/>
                <p>Lighting</p>
                <div className="mdc-typography--caption">Environment Map</div>
                <div className="mdc-grid-list environment-map-grid-list">
                    <ul className="mdc-grid-list__tiles mdc-grid-list--tile-aspect-4x3">
                        <li className="mdc-grid-tile" onClick={() => this.props.onChangeEnvMap('arches-env.png', 'Arches')}>
                            <div className="mdc-grid-tile__primary">
                                <span className="mdc-grid-tile__primary-content" style={{background: "url('/images/ibl/arches-thumb.jpg') center"}}></span>
                            </div>
                            <span className="mdc-grid-tile__secondary">Arches</span>
                        </li>
                        <li className="mdc-grid-tile" onClick={() => this.props.onChangeEnvMap('footprint-court-env.png', 'Footprint Court')}>
                            <div className="mdc-grid-tile__primary">
                                <span className="mdc-grid-tile__primary-content" style={{background: "url('/images/ibl/footprint-court-thumb.jpg') center"}}></span>
                            </div>
                            <span className="mdc-grid-tile__secondary">Footprint Court</span>
                        </li>
                        <li className="mdc-grid-tile" onClick={() => this.props.onChangeEnvMap('gloucester-env.png', 'Gloucester Church')}>
                            <div className="mdc-grid-tile__primary">
                                <span className="mdc-grid-tile__primary-content" style={{background: "url('/images/ibl/gloucester.jpg') center"}}></span>
                            </div>
                            <span className="mdc-grid-tile__secondary">Gloucester Church</span>
                        </li>
                        <li className="mdc-grid-tile" onClick={() => this.props.onChangeEnvMap('greenhouse-1-env.png', 'Greenhouse')}>
                            <div className="mdc-grid-tile__primary">
                                <span className="mdc-grid-tile__primary-content" style={{background: "url('/images/ibl/greenhouse-1-thumb.jpg') center"}}></span>
                            </div>
                            <span className="mdc-grid-tile__secondary">Greenhouse</span>
                        </li>
                        <li className="mdc-grid-tile" onClick={() => this.props.onChangeEnvMap('ice-lake-env.png', 'Ice Lake')}>
                            <div className="mdc-grid-tile__primary">
                                <span className="mdc-grid-tile__primary-content" style={{background: "url('/images/ibl/ice-lake-thumb.jpg') center"}}></span>
                            </div>
                            <span className="mdc-grid-tile__secondary">Ice Lake</span>
                        </li>
                        <li className="mdc-grid-tile" onClick={() => this.props.onChangeEnvMap('sunrise-1-env.png', 'Sunrise')}>
                            <div className="mdc-grid-tile__primary">
                                <span className="mdc-grid-tile__primary-content" style={{background: "url('/images/ibl/sunrise-1-thumb.jpg') center"}}></span>
                            </div>
                            <span className="mdc-grid-tile__secondary">Sunrise</span>
                        </li>
                        <li className="mdc-grid-tile" onClick={() => this.props.onChangeEnvMap('washington-hotel-env.png', 'Washington Hotel')}>
                            <div className="mdc-grid-tile__primary">
                                <span className="mdc-grid-tile__primary-content" style={{background: "url('/images/ibl/washington-hotel-thumb.jpg') center"}}></span>
                            </div>
                            <span className="mdc-grid-tile__secondary">
                                <span className="mdc-grid-tile__title">
                                    Washington Hotel Overlook
                                </span>
                            </span>
                        </li>
                        <li className="mdc-grid-tile" onClick={() => this.props.onChangeEnvMap('norm-env.png', 'Surface Normal')}>
                            <div className="mdc-grid-tile__primary">
                                <span className="mdc-grid-tile__primary-content" style={{background: "url('/images/ibl/norm-env.png') center"}}></span>
                            </div>
                            <span className="mdc-grid-tile__secondary">Surface Normal</span>
                        </li>
                    </ul>
                </div>
                <div style={{ display: 'inline-block', marginRight: 10 }}>
                    <div className="mdc-typography--caption">Background</div>
                    <ChromePicker color={bgColor} onChange={this.changeLighting.bind(null, 'background')}/>
                </div>
            </div>
        );
    }
}

class PlayerControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            start: new Date(),
            isPaused: false,
            delta: 0
        }
        this.elapse = function() {
            if(!this.state.isPaused) {
                this.props.onUpdateTime(
                    this.state.delta + (new Date() - this.state.start) / 1000
                );
                this.forceUpdate();
            }
            requestAnimationFrame(this.elapse);
        }.bind(this);
        this.playpause = function() {
            if(this.state.isPaused) {
                this.setState({ isPaused: false, start: new Date(), delta: this.props.time.value });
            }
            else {
                this.setState({isPaused: true});
            }
        }.bind(this);
        requestAnimationFrame(this.elapse);
    }

    render() {
        return (
            <div>
                <IconToggle value={!this.state.isPaused} on={{label: 'pause', content: 'pause'}} off={{label: 'play', content: 'play_arrow'}} onChange={this.playpause}/>
            </div>
        );
    }
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
                <div className="mdc-typography--caption">FOV ({this.props.camera.fov.toLocaleString()})</div>
                <Slider discrete step="1" value={this.props.camera.fov} min={30} max={120} onChange={this.changeFov}/>

                <p>Scene</p>
                <div className="mdc-typography--caption"><em>Waiting on official support for ranged sliders, so two sliders for now :/</em></div>
                <div className="mdc-typography--caption">Bounding Box</div>
                <p>x: <strong>{this.props.boundingBox[0].x.toFixed(2)}, {this.props.boundingBox[1].x.toFixed(2)}</strong></p>
                <div dir="rtl">
                    <Slider step="0.01" value={-this.props.boundingBox[0].x} min={-20} max={20} onChange={this.changeBounds.bind(null, 0, 'x')}/>
                </div>
                <Slider step="0.01" value={this.props.boundingBox[1].x} min={-20} max={20} onChange={this.changeBounds.bind(null, 1, 'x')}/>

                <p>y: <strong>{this.props.boundingBox[0].y.toFixed(2)}, {this.props.boundingBox[1].y.toFixed(2)}</strong></p>
                <div dir="rtl">
                    <Slider step="0.01" value={-this.props.boundingBox[0].y} min={-20} max={20} onChange={this.changeBounds.bind(null, 0, 'y')}/>
                </div>
                <Slider step="0.01" value={this.props.boundingBox[1].y} min={-20} max={20} onChange={this.changeBounds.bind(null, 1, 'y')}/>

                <p>z: <strong>{this.props.boundingBox[0].z.toFixed(2)}, {this.props.boundingBox[1].z.toFixed(2)}</strong></p>
                <div dir="rtl">
                    <Slider step="0.01" value={-this.props.boundingBox[0].z} min={-20} max={20} onChange={this.changeBounds.bind(null, 0, 'z')}/>
                </div>
                <Slider step="0.01" value={this.props.boundingBox[1].z} min={-20} max={20} onChange={this.changeBounds.bind(null, 1, 'z')}/>
            </div>
        );
    }
}
let GalleryTiles = (props) => (
    <div className="mdc-grid-list environment-map-grid-list">
        <ul className="mdc-grid-list__tiles">
            {(function() {
                let tiles = [];
                for(let key in props.snippets) {
                    tiles.push(
                        <li key={key} className="mdc-grid-tile" onClick={props.onSelect.bind(null, key)}>
                            <div className="mdc-grid-tile__primary">
                                <span className="mdc-grid-tile__primary-content" style={{background: `url('/images/thumbnails/${key}.png') center`}}></span>
                            </div>
                        </li>
                    );
                }
                return tiles;
            })()}
        </ul>
    </div>
);
