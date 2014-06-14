ZCollision.Triangle = function(v1, v2, v3){
	this.v1 = v1;
	this.v2 = v2;
	this.v3 = v3;
	ZCollision.Primitive.call(this);
}

ZCollision.Triangle.prototype = Object.create( ZCollision.Primitive.prototype );

ZCollision.Triangle.prototype.clone = function() {
	return new ZCollision.Triangle(this.v1, this.v2, this.v3);
}

ZCollision.Triangle.prototype.copy = function(tri) {
	this.v1 = tri.v1 ? tri.v1 : new THREE.Vector3();
	this.v2 = tri.v2 ? tri.v2 : new THREE.Vector3();
	this.v3 = tri.v3 ? tri.v3 : new THREE.Vector3();
}

ZCollision.Triangle.prototype.isDegenerate = function() {
	
}