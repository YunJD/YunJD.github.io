Z.CameraControl = function(camera, params) {
	var p = params || {};
	var domElement = p.domElement || {};
	p.minPolarAngle = p.minPolarAngle || -5;
	p.maxPolarAngle = p.maxPolarAngle || 5;
	p.minDolly = p.minDolly || -1;

	//Swap to maintain consistency
	if(p.minPolarAngle > p.maxPolarAngle)
		p.minPolarAngle = [p.maxPolarAngle, p.maxPolarAngle = p.minPolarAngle][0];

	if(p.minDolly > p.maxDolly)
		p.minDolly = [p.maxDolly, p.maxDolly = p.minDolly][0];

	this.camera = camera;

	//Maintains lookat.  Is the position the camera orbits.
	this.pivot = p.pivot || new THREE.Vector3();

	//Store these variables now to prevent multiple creations/deletions of vectors.
	this.deltaMove = new THREE.Vector3();
	this.offset = new THREE.Vector3();
	this.move = new THREE.Vector3();

	this.deltaTheta = 0;
	this.deltaPhi = 0;
	
	this.thetaMin = Math.max(p.minPolarAngle, Z.EPS);
	this.thetaMax = Math.min(p.maxPolarAngle, Math.PI - Z.EPS);
	
	this.scale = 1;
	this.minScale = Math.max(Z.EPS, p.minDolly);
	this.maxScale = p.maxDolly || Infinity;

	var screenExtent = Math.tan(camera.fov * 0.5) * 2;
	this.screenExtent = screenExtent;
	this.movSpeed = this.screenPixelRatio;

	//In the orbit space, Z is up and the camera orbits around it.  Personal preference.
	//Helpful reminder of parametric spheres:
	//x = cosPhi * sinTheta
	//y = sinPhi * sinTheta
	//z = cosTheta
	//Equation for orbit around Y:
	//x = cosPhi * sinTheta
	//y = cosTheta
	//z = sinPhi * sinTheta
	this.rquat = new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0,0,1));
	this.rquatInv = this.rquat.clone().inverse();

	//Force an update to synchronize.
	this.update();

	screenExtent = undefined;
	p = undefined;
	params = undefined;
	domElement = undefined;
}

Z.CameraControl.prototype.update = function() {
	this.offset.copy( this.camera.position ).sub( this.pivot );

	if(this.deltaTheta != 0 || this.deltaPhi != 0) {
		this.offset.applyQuaternion( this.rquat );

		var theta = Math.atan2(Math.sqrt(this.offset.x * this.offset.x + this.offset.y * this.offset.y), this.offset.z);

		var phi = Math.atan2(this.offset.y, this.offset.x);
		var length = Math.max(this.minScale, Math.min(this.maxScale, this.offset.length() * this.scale));

		theta += this.deltaTheta;
		phi += this.deltaPhi;

		theta = Math.max(Math.min(this.thetaMax, theta), this.thetaMin);

		var sinTheta = Math.sin(theta);

		this.offset.set(length * Math.cos(phi) * sinTheta,
						length * Math.sin(phi) * sinTheta,
						length * Math.cos(theta));

		this.offset.applyQuaternion( this.rquatInv );
	}
	else
		this.offset.multiplyScalar(this.scale);

	this.pivot.add(this.move);
	this.camera.position.copy(this.pivot).add(this.offset);
	this.move.set(0,0,0);
	this.deltaTheta = 0;
	this.deltaPhi = 0;
	this.scale = 1;

	this.camera.lookAt(this.pivot);
}

Z.CameraControl.prototype.setMovementSpeed = function( multiplier, height ) {
	this.speed = this.screenExtent * multiplier / (height * this.camera.aspect);
}

Z.CameraControl.prototype.dolly = function( dist ) {
	this.scale *= dist * this.speed;
}

Z.CameraControl.prototype.orbitUp = function(angle) {
	this.deltaTheta += angle * this.speed;
}

Z.CameraControl.prototype.orbitRight = function(angle) {
	this.deltaPhi += angle * this.speed;
}

Z.CameraControl.prototype.moveRight = function(dist) {
	var m = this.camera.matrix.elements;
	dist *= this.speed;
	this.move.x += m[0] * dist;
	this.move.y += m[1] * dist;
	this.move.z += m[2] * dist;
}

Z.CameraControl.prototype.moveUp = function(dist) {
	var m = this.camera.matrix.elements;
	dist *= this.speed;
	this.move.x += m[4] * -dist;
	this.move.y += m[5] * -dist;
	this.move.z += m[6] * -dist;
}

Z.CameraControl.prototype.moveForward = function(dist) {
	var m = this.camera.matrix.elements;
	dist *= this.speed;
	this.move.x += m[8] * dist;
	this.move.y += m[9] * dist;
	this.move.z += m[10] * dist;
}

Z.CameraControl.prototype.move = function(vector) {
	var m = this.camera.matrix.elements;
	this.deltaMove.set(m[0], m[1], m[2]).multScalar(vector.x * this.speed);
	this.move.add(this.deltaMove);

	this.deltaMove.set(m[4], m[5], m[6]).multScalar(vector.y * this.speed);
	this.move.add(this.deltaMove);

	this.deltaMove.set(m[8], m[9], m[10]).multScalar(vector.z * this.speed);
	this.move.add(this.deltaMove);
}