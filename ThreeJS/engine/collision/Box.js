Z.CollisionBBox = function (p1, p2) {
	Z.CollisionPrimitive.apply(this);
	this.pMin = new THREE.Vector3(	Math.min(p1.x, p2.x),
					Math.min(p1.y, p2.y),
					Math.min(p1.z, p2.y));
	this.pMax = new THREE.Vector3(  Math.max(p1.x, p2.x),
                                        Math.max(p1.y, p2.y),
                                        Math.max(p1.z, p2.y)); 
}

Z.CollisionBBox.prototype = Object.create(Z.CollisionPrimitive.prototype);

Z.ColisionBBox.prototype.inside = function(p) {
	return	p.x >= pMin.x && p.x <= pMax.x && 
		p.y >= pMin.y && p.y <= pMax.y && 
		p.z >= pMin.z && p.z <= pMax.z;
}
