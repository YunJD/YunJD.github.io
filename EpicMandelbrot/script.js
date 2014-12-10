(function(){
	'use strict';

	if( !Detector.webgl ){
		Detector.addGetWebGLMessage();
		return false;
	}

	var renderer = new THREE.WebGLRenderer({canvas: document.getElementById("view")});
	renderer.setClearColor( 0x000000, 1 );
	
	var camera = new THREE.OrthographicCamera(
		0,0,0,0,1,1000
	);

	var plane = new THREE.PlaneGeometry(1, 1);
	var mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({color: 'blue'}));
	mesh.scale.y = 2;
	mesh.translateZ(-1);

	var scene = new THREE.Scene();
	scene.add(mesh);


	$(window).on('resize', resize);
	resize();

	function resize() {
		var w = window.innerWidth;
		var h = window.innerHeight;

		var asp = w / h;

		camera.left = -asp;
		camera.right = asp;
		camera.top = 1;
		camera.bottom = -1;
		camera.updateProjectionMatrix();

		mesh.scale.x = 2 * asp;

		renderer.setSize(w, h);
		renderer.render(scene, camera);
	}
})();
