(function(){

	if( !Detector.webgl ){
		Detector.addGetWebGLMessage();
		return false;
	}

	var renderer = new THREE.WebGLRenderer({canvas: document.getElementById("view")});
	renderer.setClearColor( 0xA0A0A0, 1 );
	var camera = new THREE.PerspectiveCamera(
		30,		//FOV
		1,		//Aspect
		0.1,	//Near plane
		10000);	//Far plane
	camera.position.z = 20;

	var camControl = new Z.CameraControl(camera, renderer.domElement);
	camControl.setMovementSpeed( 3, renderer.domElement.height );
	var scene = new THREE.Scene();
	
	var light = new THREE.PointLight( 0xfefefe );
    light.position.set( -1, 4, 10 );
	var dirLight = new THREE.DirectionalLight( 0xff7711, 0.6 );
	dirLight.position.set(15,-1,30);
	var bluePtLt = new THREE.PointLight( 0x11aaff, 0.4 );
	bluePtLt.position.set(-2,0,6);
	var lowLight = new THREE.PointLight(0xffeecc,0.5);
	lowLight.position.set(0,-3,1);
	var charMaterial = new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x050505, shininess: 50, shading: THREE.FlatShading } );
	var hatMaterial = new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x333333, shininess: 5 } );
	hatMaterial.side = THREE.DoubleSide;
	
	var charMesh1, charMesh2, charMesh3;
	var loader = new THREE.JSONLoader();
	loader.load( "geometry/char.js", function(geometry){
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		charMesh1 = new THREE.Mesh(geometry, charMaterial);
		charMesh2 = new THREE.Mesh(geometry, charMaterial);
		charMesh2.position.x = 10;
		charMesh3 = new THREE.Mesh(geometry, charMaterial);
		charMesh3.position.x = -10;
		scene.add(charMesh1);
		scene.add(charMesh2);
		scene.add(charMesh3);
	});
	
	var hatMesh;
	loader.load( "geometry/hat.js", function(geometry){
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		hatMesh = new THREE.Mesh(geometry, hatMaterial);
		scene.add(hatMesh);
	});
	
	scene.add(light);
	scene.add(dirLight);
	scene.add(bluePtLt);
	scene.add(lowLight);
	scene.add(camera);

	$(window).resize(function(){
		var w = window.innerWidth;
		var h = window.innerHeight;
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		renderer.setSize(w, h);
		camControl.setMovementSpeed( 3, h );
	}).resize();

	var wndX;
	var wndY;
	var dX;
	var dY;
	var mousedown = false;
	$(renderer.domElement).on("mousedown", function(e) {
		e.preventDefault();
		wndX = e.clientX;
		wndY = e.clientY;
		dX = 0;
		dY = 0;

		if(!mousedown) {
			$(window).on("mouseup.camera", mouseUpHandler);
			$(window).on("mousemove.camera", deltaHandler);
		}
		switch(e.which){
			case 1:
				$(window).on('mousemove.camera', rotateHandler)
				break;
			case 3:
				$(window).on('mousemove.camera', moveHandler);
		}
	});

	$(renderer.domElement).on("contextmenu", function(e) {
		return false;
	});

	function deltaHandler(e) {
		dX = e.clientX - wndX;
		dY = e.clientY - wndY;
		wndX = e.clientX;
		wndY = e.clientY;
	}

	function moveHandler(e) {
		camControl.moveUp(dY);
		camControl.moveRight(dX);
	}

	function rotateHandler(e) {
		camControl.orbitUp(dY);
		camControl.orbitRight(dX);
	}

	function mouseUpHandler(e) {
		$(window).off('mousemove.camera');
		$(window).off('mouseup.camera');
	}

	(function animate(){
		camControl.update();
		animFrame(animate);
		renderer.render(scene, camera);
	})();
})();