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
      $("#toggle-frag").text("Nevermind.");
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

  if( !Detector.webgl ){
    Detector.addGetWebGLMessage();
    return false;
  }


  var texSettings = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType
  };

  var renderer = new THREE.WebGLRenderer({canvas: document.getElementById("view")});
  renderer.setClearColor( 0x000000, 1 );
  renderer.autoClear = false;

  var w, h;

  var camera = new THREE.OrthographicCamera(
    -1,1,1,-1,1,1000
  );

  var mandelbrotTex = {
    type: 't',
    value: null
  };
  //Input cannot be the same as output, so use this to swap textures around.
  var mandelbrotTexTarget = {
    type: 't',
    value: null
  };

  var texMat = new THREE.ShaderMaterial({
    uniforms: {
      mandelbrotTex: mandelbrotTex,
      scale: {
        type: 'v2',
        value: new THREE.Vector2(1.0, 1.1)
      },
      translate: {
        type: 'v2',
        value: new THREE.Vector2(0, 0)
      },
      pxDisp: {
        type: 'v2',
        value: new THREE.Vector2(0, 0)
      }
    },
    vertexShader: $("#mandel-vert-shader").val(),
    fragmentShader: $("#mandelbrot-shader").val(),
    depthWrite: false
  });

  var drawMat = new THREE.ShaderMaterial({
    uniforms: {
      mandelbrotTex: mandelbrotTex,
      passes: {
        type: 'f',
        value: 0.0
      }
    },
    vertexShader: $("#mandel-vert-shader").val(),
    fragmentShader: $("#draw-shader").val(),
    depthWrite: false
  });
  var update;

  var plane = new THREE.PlaneGeometry(1, 1);
  var mesh = new THREE.Mesh(plane, texMat);
  mesh.scale.y = mesh.scale.x = 2;
  //WebGL coordinate system is right-handed.
  mesh.translateZ(-100);

  var scene = new THREE.Scene();
  scene.add(mesh);

  updateShader();
  resize();

  //Actually draw what was computed.
  draw();

  function draw() {
    if(update) {
      update = false;
      if(mandelbrotTex.value)
        mandelbrotTex.value.dispose();
      mandelbrotTex.value = new THREE.WebGLRenderTarget(w, h, texSettings);
      if(mandelbrotTexTarget.value)
        mandelbrotTexTarget.value.dispose();
      mandelbrotTexTarget.value = new THREE.WebGLRenderTarget(w, h, texSettings);
      drawMat.uniforms.passes.value = 0;
    }

    if(drawMat.uniforms.passes.value >= 16) {
      requestAnimationFrame(draw);
      return;
    }

    renderer.render(scene, camera, mandelbrotTexTarget.value);
                //Swap!!
                var tmptex = mandelbrotTex.value;
    mandelbrotTex.value = mandelbrotTexTarget.value;
                mandelbrotTexTarget.value = tmptex;

    texMat.uniforms.pxDisp.value.x = Math.random() / w;
    texMat.uniforms.pxDisp.value.y = Math.random() / h;


    ++drawMat.uniforms.passes.value;
    
    var oldMat = mesh.material;
    mesh.material = drawMat;

    renderer.render(scene, camera);

    mesh.material = oldMat;
    requestAnimationFrame(draw);
  }
  
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

    texMat.uniforms.scale.value.x = asp;

    renderer.setSize(w, h);
  }

  function updateShader() {
    update = true;
    texMat.fragmentShader = $("#mandelbrot-shader").val();
    texMat = texMat.clone();
    mesh.material = texMat;
  }

  $("#resize").click(resize);
  $("#recompile").click(updateShader);

  var mDown = false;
  var mx, my;

  $("#view").mousedown(function(e) {
    if(e.button == 0) {
      mDown = true;

      mx = e.screenX;
      my = e.screenY;
    }
  });

  $("#view").bind('mousewheel', function(e) {
    e.preventDefault();
    update = true;
    mDown = false;

    var delta = e.originalEvent.wheelDelta / 480.;
    if(e.originalEvent.wheelDelta < 0) {
      delta *= -1.;
      texMat.uniforms.scale.value.y *= 1. + delta;
      texMat.uniforms.translate.value.x /= 1. + delta;
      texMat.uniforms.translate.value.y /= 1. + delta;
    }
    else {
      texMat.uniforms.scale.value.y /= 1. + delta;
      texMat.uniforms.translate.value.x *= 1. + delta;
      texMat.uniforms.translate.value.y *= 1. + delta;
    }
  });

  $(window).mousemove(function(e) {
    if(mDown) {
      var dx = e.screenX - mx;
      var dy = e.screenY - my;
      texMat.uniforms.translate.value.x -= dx / h;
      texMat.uniforms.translate.value.y += dy / h;
      mx = e.screenX;
      my = e.screenY;
      update = true;
      e.preventDefault();
    }
  });

  $(window).mouseup(function() {
    mDown = false;
  });
})();
