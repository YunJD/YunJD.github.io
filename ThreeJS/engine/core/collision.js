Z.CollisionPrimitive = function() {}

Z.CollisionPrimitive.prototype.intersect = function(isect) {
	return false;
}

Z.CollisionPrimitive.prototype.inside = function(p) {
	return false;
}

Z.CollisionPrimitive.prototype.clone = function() {
	return new Z.CollisionPrimitive();
}

Z.CollisionPrimitive.prototype.copy = function(other) {
	return new Z.Collision);
}
