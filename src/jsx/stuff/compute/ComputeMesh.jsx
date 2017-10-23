import * as T from 'three';

//We want a 1-to-1 projection from the texel to the data array.
const COMPUTE_ORTHO_CAMERA = new T.OrthographicCamera(
    -0.5, //Left
    0.5, //Right
    0.5, //Top
    -0.5, //Bottom
    0.5, //Near
    1000 //Far
);

const COMPUTE_MESH = new T.PlaneGeometry(1, 1);
COMPUTE_MESH.translateZ(-1);

export default class {
    constructor(w, h = 1, camera = null) {
        this.w = w;
        this.h = h;

        this.camera = camera || COMPUTE_ORTHO_CAMERA.clone();
        camera.updateProjectionMatrix();
    }
}
