import * as T from 'three'
import glslComputeVertex from './shaders/computeVertex'

//We want a 1-to-1 projection from the texel to the data array. We can also normalize to extents [(-0.5, 0.5), (-0.5, 0.5)], by default.
const COMPUTE_ORTHO_CAMERA = new T.OrthographicCamera(
    -0.5, //Left
    0.5, //Right
    0.5, //Top
    -0.5, //Bottom
    0.25, //Near
    1000 //Far
)

//Basically a quad to draw 2D
const COMPUTE_PLANE = new T.PlaneGeometry(1, 1)

const TEX_SETTINGS = {
    minFilter: T.NearestFilter,
    magFilter: T.NearestFilter,
    format: T.RGBAFormat,
    type: T.FloatType,
}

export default class {
    constructor(shader, w, h = 1, targetName = null, renderer = null) {
        //This is the name used to feed the render target back into the shader as a texture. If null, will be ignored.
        this.targetName = targetName
        this.w = w
        this.h = h

        this.camera = COMPUTE_ORTHO_CAMERA.clone()
        this.camera.updateProjectionMatrix()

        this.texTarget = {
            type: 't',
            v: targetName ? new T.WebGLRenderTarget(w, h, TEX_SETTINGS) : null,
            t: new T.WebGLRenderTarget(w, h, TEX_SETTINGS),
        }

        if (targetName) {
            shader.uniforms[targetName] = this.texTarget
            this.texTarget.value = this.texTarget.v.texture
        }

        this.material = new T.RawShaderMaterial({
            uniforms: shader.uniforms, //T.UniformsUtils.clone(shader.uniforms), //Clone breaks references to Float32 arrays and such for data textures.
            vertexShader: glslComputeVertex,
            fragmentShader: shader.fragmentShader,
            depthWrite: false,
            depthTest: false,
        })

        //three.js centers the COMPUTE_PLANE.  This means that the camera view extents are (-0.5, -0.5), (0.5, 0.5) and
        //the plane's position is (-0.5, -0.5, z), (0.5, 0.5, z). Because of the orthographic projection, z can take on
        //any value between -0.5 and 1000.
        this.mesh = new T.Mesh(COMPUTE_PLANE.clone(), this.material)
        this.mesh.translateZ(-1)

        this.scene = new T.Scene()
        this.scene.add(this.mesh)

        if (renderer == null) {
            this.ownsRenderer = true
            renderer = new T.WebGLRenderer()
            renderer.setClearColor(0, 1)
            renderer.autoClear = false
            renderer.setSize(w, h)
        } else {
            this.ownsRenderer = false
        }
        this.renderer = renderer
    }
    execute(renderToCanvas) {
        //This if-statement is probably not necessary, could simply always draw to canvs & the target.
        if (renderToCanvas) {
            this.renderer.setRenderTarget(null)
            this.renderer.render(this.scene, this.camera)
            return
        }

        //Draw to target
        this.renderer.setRenderTarget(this.texTarget.t)
        this.renderer.render(this.scene, this.camera)
        if (this.targetName) {
            //Swap the textures
            const temp = [this.texTarget.v, this.texTarget.t]
            this.texTarget.t = temp[0]
            this.texTarget.v = temp[1]
            this.texTarget.value = this.texTarget.v.texture
        }
    }
    getData(x = 0, y = 0, w = null, h = null, buffer = null) {
        w = w || this.w
        h = h || this.h

        buffer = buffer || new Float32Array(4 * w * h)
        this.renderer.readRenderTargetPixels(this.targetName ? this.texTarget.v : this.texTarget.t, x, y, w, h, buffer)
        return buffer
    }
    updateFragmentShaderCleanly(newFragment) {
        this.material.dispose()
        //We want to keep uniform references (e.g. camera)
        this.material = new T.RawShaderMaterial({
            uniforms: this.material.uniforms,
            vertexShader: this.material.vertexShader,
            fragmentShader: newFragment,
            depthWrite: false,
            depthTest: false,
        })
        this.mesh.material = this.material
    }
    dispose() {
        this.mesh.geometry.dispose()
        this.mesh.material.dispose()
        this.texTarget.t.dispose()
        if (this.targetName) {
            this.texTarget.v.dispose()
        }
        if (this.ownsRenderer) {
            this.renderer.dispose()
        }
    }
    resize(w, h) {
        this.w = w
        this.h = h

        this.texTarget.t.setSize(w, h)

        if (this.targetName) {
            this.texTarget.v.setSize(w, h)
        }
        if (this.ownsRenderer) {
            this.renderer.setSize(w, h)
        }
    }
}
