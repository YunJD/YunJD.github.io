window.animFrame = (function(){
	return	window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
})();

//Initialize globals and namespaces
var Z = {
	EPS: 0.000001
};

ZCollision = {};