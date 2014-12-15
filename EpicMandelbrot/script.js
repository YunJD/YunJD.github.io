(function(){
	'use strict';

	$("textarea.code-area").on('keydown', function(e) {
		if(e.which == 9) {
			var start = this.selectionStart;
			var end = this.selectionEnd;

			this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
			this.selectionStart = this.selectionEnd = start + 4;
			e.preventDefault();

			return false;
		}
	});

	$("#toggle-frag").click(function() {
		if($("#fragment-shader").css('display') == 'none') {
			$("#toggle-frag").text("I regret looking at this code.");
			$("#fragment-shader").show();
			$("#recompile").parent().show();
		} else {
			$("#toggle-frag").text("I'll write my own shader!");
			$("#fragment-shader").hide();
			$("#recompile").parent().hide();
		}
	});
})();

(function() {
	'use strict';
	var update = false;

	if( !Detector.webgl ){
		Detector.addGetWebGLMessage();
		return false;
	}

	var renderer = new THREE.WebGLRenderer({canvas: document.getElementById("view")});
	renderer.setClearColor( 0x000000, 1 );
	var w, h;

	var camera = new THREE.OrthographicCamera(
		0,0,0,0,1,1000
	);

	var plane = new THREE.PlaneGeometry(1, 1);
	var mesh = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({color: 'orange'}));
	mesh.scale.y = 2;
	mesh.translateZ(-1);

	var scene = new THREE.Scene();
	scene.add(mesh);

	var renderTex = null;

	resize();

	function resize() {
		update = true;
		//Maybe I'll comment this.  Maybe.
		w = $("#width").val();
		h = $("#height").val();
		if(isNaN(w)) {
			w = 2000;
			$("#width").val(2000);
		} else {
			w = parseInt(w);
		}
		if(isNaN(h)) {
			h = 2000;
			$("#height").val(2000);
		} else {
			h = parseInt(h);
		}

		var $canv = $("#view").css({'margin-left': -w * 0.5, 'margin-top': -h * 0.5});

		var asp = w / h;

		camera.left = -asp;
		camera.right = asp;
		camera.top = 1;
		camera.bottom = -1;
		camera.updateProjectionMatrix();

		mesh.scale.x = 2 * asp;

		//RGBA so that alpha can be used as # of samples.
		//The filters are more or less redundant as the canvas size changes
		//with the size of the requested pic.
		renderTex = new THREE.WebGLRenderTarget(w, h, {
			minFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType
		});

		renderer.setSize(w, h);
		renderer.render(scene, camera);
	}

	function recompile() {
		update = true;
	}

	$("#resize").click(resize);
	$("#recompile").click(recompile);
})();
