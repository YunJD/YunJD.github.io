ZCollision.Primitive = function() {}

ZCollision.Primitive.prototype.intersect = function(prim, isect) {
	return false;
}

ZCollision.Primitive.prototype.inside = function(p) {
	return false;
}

ZCollision.Primitive.prototype.clone = function() {
	return new ZCollision.primitive();
}

ZCollision.Primitive.prototype.copy = function(other) {
	return new ZCollision();
}

ZCollision.ConvexPrimitive = function(){}

ZCollision.ConvexPrimitive.prototype = Object.create( ZCollision.Primitive.prototype );

ZCollision.ConvexPrimitive.prototype.support = function(v) {
	return -1;
}