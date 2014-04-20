(function(){

	if( !Detector.webgl ){
		Detector.addGetWebGLMessage();
		return false;
	}
	var deltaMat = new THREE.Matrix4();
	var renderer = new THREE.WebGLRenderer({canvas: document.getElementById("view")});
	renderer.setClearColor( 0xA0A0A0, 1 );
	var camera = new THREE.PerspectiveCamera(
		70,		//FOV
		1,		//Aspect
		0.1,	//Near plane
		10000);	//Far plane
	camera.position.z = 12.5;
	camera.position.y = 2;
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
	
	var charMesh;
	var loader = new THREE.JSONLoader();
	loader.load( "geometry/char.js", function(geometry){
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		charMesh = new THREE.Mesh(geometry, charMaterial);
		scene.add(charMesh);
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
	}).resize();
	
	var mx, my;
	function mouseMove(e){
		charMesh.rotation.y += (e.pageX - mx) * 0.005;
		charMesh.rotation.x += (e.pageY - my) * 0.005;
		hatMesh.rotation.y = charMesh.rotation.y;
		hatMesh.rotation.x = charMesh.rotation.x;
		mx = e.pageX;
		my = e.pageY;
	}
	function mouseUp(e){
		$(window).off("mousemove");
		$(window).off("mouseup");
	}
	$(renderer.domElement).mousedown(function(e){
		switch(e.which)
		{
		case 1:
			mx = e.pageX;
			my = e.pageY;
			$(window).on("mousemove", mouseMove);
			$(window).on("mouseup", mouseUp);
			break;
		}
	});
	$(window).on("mousescroll", function(e){
		
	});
	(function animate(){
		animFrame(animate);
		renderer.render(scene, camera);
	})();
})();