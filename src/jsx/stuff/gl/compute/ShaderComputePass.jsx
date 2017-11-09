import * as T from 'three';
import computeVertShader from './shaders/compute_vertex.vert';

//We want a 1-to-1 projection from the texel to the data array. We can also normalize to extents [(-0.5, 0.5), (-0.5, 0.5)], by default.
const COMPUTE_ORTHO_CAMERA = new T.OrthographicCamera(
    -0.5, //Left
    0.5, //Right
    0.5, //Top
    -0.5, //Bottom
    0.5, //Near
    1000 //Far
);

//Basically a quad to draw 2D
const COMPUTE_PLANE = new T.PlaneGeometry(1, 1);

const TEX_SETTINGS = {
    minFilter: T.NearestFilter,
    magFilter: T.NearestFilter,
    format: T.RGBAFormat,
    type: T.FloatType
};


export default class {
    constructor(shader, w, h = 1, targetName = null, canvas = null) {
        //This is the name used to feed the render target back into the shader as a texture. If null, will be ignored.
        this.canvas = canvas;
        this.targetName = targetName;
        this.w = w;
        this.h = h;

        this.camera = COMPUTE_ORTHO_CAMERA.clone();
        this.camera.updateProjectionMatrix();

        this.texTarget = {
            type: 't',
            v: targetName ? new T.WebGLRenderTarget(w, h, TEX_SETTINGS) : null,
            t: new T.WebGLRenderTarget(w, h, TEX_SETTINGS)
        };

        if(targetName) {
            shader.uniforms[targetName] = this.texTarget;
            this.texTarget.value = this.texTarget.v.texture;
        }

        this.material = new T.ShaderMaterial({
            uniforms: shader.uniforms, //T.UniformsUtils.clone(shader.uniforms),
            vertexShader: computeVertShader(),
            fragmentShader: shader.fragmentShader,
            depthWrite: false
        });

        //three.js centers the COMPUTE_PLANE.  This means that the camera view extents are (-0.5, -0.5), (0.5, 0.5) and
        //the plane's position is (-0.5, -0.5, z), (0.5, 0.5, z). Because of the orthographic projection, z can take on
        //any value between -0.5 and 1000.
        this.mesh = new T.Mesh(COMPUTE_PLANE.clone(), this.material);
        this.mesh.translateZ(-1);

        this.scene = new T.Scene();
        this.scene.add(this.mesh);

        this.renderer = new T.WebGLRenderer(canvas ? { canvas } : undefined);
        this.renderer.setClearColor(0, 1);
        this.renderer.autoClear = false;
        this.renderer.setSize(w, h);
    }
    execute() {
        if(this.canvas) {
            this.renderer.render(this.scene, this.camera);
            return;
        }

        //Draw to target
        this.renderer.render(this.scene, this.camera, this.texTarget.t);
        if(this.targetName) {
            //Swap the textures
            [this.texTarget.t, this.texTarget.v] = [this.texTarget.v, this.texTarget.t];
            this.texTarget.value = this.texTarget.v.texture;
        }
    }
    getData(x=0, y=0, w=null, h=null, buffer=null) {
        w = w || this.w;
        h = h || this.h;

        buffer = buffer || new Float32Array(4 * w * h);
        this.renderer.readRenderTargetPixels(this.targetName ? this.texTarget.v : this.texTarget.t, x, y, w, h, buffer);
        return buffer;
    }
    dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.texTarget.t.dispose();
        if(this.targetName) {
            this.texTarget.v.dispose();
        }
    }
    resize(w, h) {
        this.dispose();

        this.w = w;
        this.h = h;

        this.texTarget.value.dispose();
        this.texTarget.target.dispose();
        this.texTarget.value = new T.WebGLRenderTarget(w, h, TEX_SETTINGS);
        this.texTarget.target = new T.WebGLRenderTarget(w, h, TEX_SETTINGS);
        this.renderer.setSize(w, h);
    }
}
