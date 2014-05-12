Z.CameraControl = function(camera, params) {
	var p = params || {};
	p.minPolarAngle = p.minPolarAngle || -5;
	p.maxPolarAngle = p.maxPolarAngle || 5;
	p.minScale = Z.EPS;

	//Swap to maintain constraint
	if(p.minPolarAngle > p.maxPolarAngle)
		p.minPolarAngle = [p.maxPolarAngle, p.maxPolarAngle = p.minPolarAngle][0];

	this.camera = camera;

	//Maintains lookat.  Is the position the camera orbits.
	this.pivot = p.pivot || new THREE.Vector3();

	//Store these variables now to prevent multiple creations/deletions of vectors.
	this.deltaMove = new THREE.Vector3();
	this.offset = new THREE.Vector3();
	this.move = new THREE.Vector3();

	this.deltaTheta = 0;
	this.deltaPhi = 0;
	
	this.thetaMin = -Infinity;//Math.max(p.minPolarAngle, Z.EPS);
	this.thetaMax = Infinity;//Math.min(p.maxPolarAngle, Math.PI - Z.EPS);

	this.scale = 1;
	this.minScale = Math.max(Z.EPS, p.minScale);
	this.maxScale = Math.max(this.minScale, p.maxScale || Infinity);

	this.screenExtent = camera.fov ? 	Math.tan(camera.fov * 0.5 * Math.PI / 180) * 2 :
										Math.abs(camera.right - camera.left);

	this.moveSpeed = this.screenExtent;
	this.dollySpeed = 1;
	this.orbitSpeed = 1;

	//In the orbit space, Z is up and the camera orbits around it.  Personal preference.
	//Helpful reminder of parametric spheres:
	//x = cosPhi * sinTheta
	//y = sinPhi * sinTheta
	//z = cosTheta
	//For orbit around Y:
	//x = cosPhi * sinTheta
	//y = cosTheta
	//z = sinPhi * sinTheta
	this.rquat = new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0,0,1));
	this.rquatInv = this.rquat.clone().inverse();

	//Force an update to synchronize.
	this.update();

	p = undefined;
	params = undefined;
}

Z.CameraControl.prototype.update = function() {
	this.offset.copy( this.camera.position ).sub( this.pivot );

	if(this.deltaTheta != 0 || this.deltaPhi != 0) {
		this.offset.applyQuaternion( this.rquat );

		var phi = Math.atan2(this.offset.y, this.offset.x);
		phi += this.deltaPhi;

		var theta = Math.atan2(Math.sqrt(this.offset.x * this.offset.x + this.offset.y * this.offset.y), this.offset.z);
		theta += this.deltaTheta;
		theta = Math.max(Math.min(this.thetaMax, theta), this.thetaMin);

		var r = this.offset.length();

		var sinTheta = Math.sin(theta);
		this.offset.set(r * Math.cos(phi) * sinTheta,
						r * Math.sin(phi) * sinTheta,
						r * Math.cos(theta));

		this.offset.applyQuaternion( this.rquatInv );

		this.deltaTheta = this.deltaPhi = 0;
		
		//When theta reaches the extents, flip the quaternion's vertical view.
		if(theta < 0 || theta >= Math.PI) {
			this.camera.up.multiplyScalar(-1);
			this.rquat.setFromUnitVectors(this.camera.up, new THREE.Vector3(0,0,1));
			this.rquatInv = this.rquat.clone().inverse();
		}
	}

	this.offset.multiplyScalar( Math.max(this.minScale, Math.min(this.maxScale, this.scale)) );

	this.pivot.add(this.move);
	this.camera.position.copy(this.pivot).add(this.offset);
	this.move.set(0,0,0);
	this.scale = 1;

	this.camera.lookAt(this.pivot);
}

Z.CameraControl.prototype.setSpeed = function( multiplier, height, sceneScale ) {
	this.setMoveSpeed( multiplier, height );
	this.setOrbitSpeed( multiplier, height );
	this.setDollySpeed( multiplier, height );
}

Z.CameraControl.prototype.setDollySpeed = function( multiplier, height ) {
	//With a multiplier of 1, moving through the height of the screen will alter the scale by a factor of 2
	this.dollySpeed = multiplier / height;
}

Z.CameraControl.prototype.setOrbitSpeed = function( multiplier, height ) {
	//If the multiplier is 1, rotate exactly half a circle if the mouse traverses the distance of the screen height.
	this.orbitSpeed = multiplier * Math.PI / height;
}

Z.CameraControl.prototype.setMoveSpeed = function( multiplier, height ) {
	//If multiplier is 1, target moves with mouse.
	var length = this.offset.copy( this.camera.position ).sub( this.pivot ).length();
	this.moveSpeed = this.screenExtent * length * multiplier / height;
}

Z.CameraControl.prototype.dolly = function( dist ) {
	dist = dist > 0 ?	1 + dist * this.dollySpeed : 
						1 / (1 - dist * this.dollySpeed);
	this.scale *= dist;
	this.moveSpeed *= dist;
}

Z.CameraControl.prototype.orbitUp = function(angle) {
	this.deltaTheta -= angle * this.orbitSpeed;
}

Z.CameraControl.prototype.orbitRight = function(angle) {
	this.deltaPhi -= angle * this.orbitSpeed;
}

Z.CameraControl.prototype.moveRight = function(dist) {
	var m = this.camera.matrix.elements;
	dist *= this.moveSpeed;
	this.move.x += m[0] * -dist;
	this.move.y += m[1] * -dist;
	this.move.z += m[2] * -dist;
}

Z.CameraControl.prototype.moveUp = function(dist) {
	var m = this.camera.matrix.elements;
	dist *= this.moveSpeed;
	this.move.x += m[4] * -dist;
	this.move.y += m[5] * -dist;
	this.move.z += m[6] * -dist;
}

Z.CameraControl.prototype.moveForward = function(dist) {
	var m = this.camera.matrix.elements;
	dist *= this.moveSpeed;
	this.move.x += m[8] * dist;
	this.move.y += m[9] * dist;
	this.move.z += m[10] * dist;
}

Z.CameraControl.prototype.move = function(vector) {
	var m = this.camera.matrix.elements;
	this.deltaMove.set(m[0], m[1], m[2]).multScalar(vector.x * this.moveSpeed);
	this.move.add(this.deltaMove);

	this.deltaMove.set(m[4], m[5], m[6]).multScalar(vector.y * this.moveSpeed);
	this.move.add(this.deltaMove);

	this.deltaMove.set(m[8], m[9], m[10]).multScalar(vector.z * this.moveSpeed);
	this.move.add(this.deltaMove);
}