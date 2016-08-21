(function() {
  'use strict';

  if (!String.prototype.format) {
    String.prototype.format = function(kwargs) {
      var args = arguments;

      return this.replace(/{(\w+)}/g, function(match, number) {
        if(typeof kwargs == 'object') {
          var lookup = number || match.substr(1, match.length - 1);

          return typeof kwargs[lookup] != 'undefined'
            ? kwargs[lookup]
            : match
        }
        else {
          return typeof arguments[number] != 'undefined'
            ? arguments[number]
            : match
          ;
        }
      }); };
  }

  window.between = function(n, a, b, inclusiveA, inclusiveB) {
      return (inclusiveA ? n >= a : n > a)
        && (inclusiveB ? n <= b : n < b);
  };

  if(!Number.prototype.between) {
    Number.prototype.between = function(a, b, incA, incB) {
      return between(this, a, b, incA, incB);
    };
  }

})();

(function() {
  'use strict';

  if( !Detector.webgl ){
    Detector.addGetWebGLMessage();
    return false;
  }

  var options = {
    rng: new MersenneTwister(),
    PREPROCESS_TRANSLATE: new THREE.Vector2(-0.612, 0.),
    PREPROCESS_SCALE: 1.247,
    PREPROCESS_SIZE: 1500, //Side length of a square texture that determines mandelbrot precompute size.

    INTEREST_REGION_DELTA: 1, //Pixels away from regions that have escape iterations within the given range.
    ESCAPE_RANGE: [32, 2048], //Anything with escape iterations outside this range is ignored. The max is my upper limit on iterations as well, as per typical mandelbrot.
    SAMPLE_SIZE: 4096, //Sample-size per buddhabrot pass.
    TRANSLATE: new THREE.Vector2(-0.3, 0.),
    SCALE: 1.2,
    COLOR_RANGES: [
      [200, 2048],
      [0, 1200],
      [0, 256]
    ]
  };
  /* I've setup my fragment shader so that the texture starts with extents
   * [(0,0), (1,1)], i.e. a unit square.  I transform the extent corners to be
   * [(-1, -1), (1, 1) + translate] * scale.  As such, each pixel has
   * side-length 2 * scale / texture-resolution in the view-plane.
   */
  options.JITTER_SIZE = 2. * options.PREPROCESS_SCALE / options.PREPROCESS_SIZE;

  var texSettings = {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType
  };

  //Since I'm just doing 2d, an orthographic camera helps by normalizing to proper extents [(-0.5, 0.5), (-0.5, 0.5)].
  var camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.5, 1000);
  camera.updateProjectionMatrix();

  var $canv = $("#render-view");
  var complexOps = $("#complex-ops").html();

//==============================================================================
//Preprocess Stage
//==============================================================================

  var samplingRegions = (function() {
    var sampleTexTarget = {
      type: 't',
      value: new THREE.WebGLRenderTarget(options.PREPROCESS_SIZE, options.PREPROCESS_SIZE, texSettings)
    };

    var samplingShaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        scale: {
          type: 'f',
          value: options.PREPROCESS_SCALE
        },
        translate: {
          type: 'v2',
          value: options.PREPROCESS_TRANSLATE
        }
      },
      vertexShader: $("#vert-shader").html(),
      fragmentShader: complexOps + $("#preprocess-shader").html().format({MAX_ITER: Math.min(4000, options.ESCAPE_RANGE[1]).toExponential()}),
      depthWrite: false
    });

    //Basically a quad to draw 2d
    var samplingMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), samplingShaderMaterial);
    samplingMesh.translateZ(-1);

    var samplingScene = new THREE.Scene();
    samplingScene.add(samplingMesh);

    var samplingRenderer = new THREE.WebGLRenderer();
    samplingRenderer.setClearColor( 0x000000, 1);
    samplingRenderer.autoClear = false;
    samplingRenderer.setSize(options.PREPROCESS_SIZE, options.PREPROCESS_SIZE);

    samplingRenderer.render(samplingScene, camera, sampleTexTarget.value);

    var samplegl = samplingRenderer.getContext();

    //Precompute mandelbrot.  This will help choose random samples to be better than sampling a uniform box.
    var sampleBuffer = new THREE.DataTexture(new Float32Array(options.PREPROCESS_SIZE * options.PREPROCESS_SIZE * 4), 
      options.PREPROCESS_SIZE, options.PREPROCESS_SIZE, THREE.RGBAFormat
    );
    samplegl.readPixels(0, 0, options.PREPROCESS_SIZE, options.PREPROCESS_SIZE, samplegl.RGBA, samplegl.FLOAT, sampleBuffer.image.data);

    var samplingRegions = getSamplingRegions(sampleBuffer, options);

    //Dispose the sampleBuffer before creating one to sample random coordinates.
    sampleBuffer.dispose();
    sampleTexTarget.value.dispose();

    return samplingRegions;
  })();

//==============================================================================
//Buddhabrot sampling
//==============================================================================

  //Used to sample initial set of coordinates.
  var samplingTex = {
    type: 't',
    value: new THREE.DataTexture(new Float32Array(options.SAMPLE_SIZE * 4), options.SAMPLE_SIZE, 1, THREE.RGBAFormat, THREE.FloatType)
  };

  var stepTex = {
    type: 't',
    value: new THREE.DataTexture(new Float32Array(options.SAMPLE_SIZE * 4), options.SAMPLE_SIZE, 1, THREE.RGBAFormat, THREE.FloatType)
  };

  var targetStepTex = {
    type: 't',
    value: new THREE.WebGLRenderTarget(options.SAMPLE_SIZE, 1, texSettings),
    target: new THREE.WebGLRenderTarget(options.SAMPLE_SIZE, 1, texSettings)
  };

  //Waste some space for the sake of easy color indexing
  var colorFlags = new Uint8Array(options.SAMPLE_SIZE * 4);

  var sMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
    uniforms: {
      maxIter: {
        type: 'f',
        value: options.ESCAPE_RANGE[1]
      },
      clear: {
        type: 'i',
        value: 1
      },
      samples: samplingTex,
      steps: targetStepTex
    },
    vertexShader: $("#vert-shader").html(),
    fragmentShader: complexOps + $("#mandelbrot-shader").html(),
    depthWrite: false
  }));
  sMesh.translateZ(-1);

  var samplingScene = new THREE.Scene();
  samplingScene.add(sMesh);

  var samplingRenderer = new THREE.WebGLRenderer();
  var samplegl = samplingRenderer.getContext();
  samplingRenderer.setClearColor( 0x000000, 1);
  samplingRenderer.autoClear = false;
  samplingRenderer.setSize(options.SAMPLE_SIZE, 1);

//==============================================================================
//Main image renderer
//==============================================================================

  var renderer = new THREE.WebGLRenderer({ canvas: $canv[0] });
  renderer.setClearColor( 0x000000, 1);
  renderer.autoClear = false;

  var bufferedTexImage = {
    type: 't',
    value: null
  };

  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
    uniforms: {
      dataImage: bufferedTexImage,
      histMax: {
        type: 'v3'
      }
    },
    vertexShader: $("#vert-shader").html(),
    fragmentShader: $("#data-image-shader").html(),
    depthWrite: false
  }));
  mesh.translateZ(-1);
  var scene = new THREE.Scene();
  scene.add(mesh);

  resize(1920, 1080);


  var k = 0;
  mesh.material.uniforms.histMax.value = 1;
  var histMax = new THREE.Vector3(1., 1., 1.);

  function draw() {
    ++k;
    sMesh.material.uniforms.clear.value = 1;
    sampleCoords(samplingRegions, samplingTex.value, options);

    for(var i = 0; i < options.ESCAPE_RANGE[1]; ++i) {
      samplingRenderer.render(samplingScene, camera, targetStepTex.target);
      sMesh.material.uniforms.clear.value = 0;

      var temp = targetStepTex.target;
      targetStepTex.target = targetStepTex.value;
      targetStepTex.value = temp;
    }

    samplegl.readPixels(0, 0, options.SAMPLE_SIZE, 1, samplegl.RGBA, samplegl.FLOAT, stepTex.value.image.data);

    var n = collectEscapedCoords(samplingRenderer, samplingTex.value, stepTex.value, colorFlags, options);
    if(n) {
      sMesh.material.uniforms.clear.value = 1;

      for(var i = 0; i < options.ESCAPE_RANGE[1]; ++i) {
        samplingRenderer.render(samplingScene, camera, targetStepTex.target);
        sMesh.material.uniforms.clear.value = 0;

        samplegl.readPixels(0, 0, options.SAMPLE_SIZE, 1, samplegl.RGBA, samplegl.FLOAT, stepTex.value.image.data);

        for(var j = 0; j < n; j += 4) {
          if(stepTex.value.image.data[j + 3.] != 1.) {
            histMax = accumulate(
              bufferedTexImage.value,
              options, 
              stepTex.value.image.data.subarray(j, j + 2),
              histMax,
              colorFlags,
              j
            );
          }
        }

        var temp = targetStepTex.target;
        targetStepTex.target = targetStepTex.value;
        targetStepTex.value = temp;
      }
    }
    mesh.material.uniforms.histMax.value = histMax;

    renderer.render(scene, camera);
    //2 ^ 23 - 1
    //if(mesh.material.uniforms.histMax.value < 8388607) {
    //}
    setTimeout(draw, 0);
  }
  draw();
  //Visualize preprocess importance sampling
  /*
  for(var i = 0; i < samplingRegions.length; i += 2) {
    accumulate(bufferedTexImage.value, options, samplingRegions.subarray(i, i + 2), 1.);
  }
  renderer.render(scene, camera);
  */

//==============================================================================
//Buddhabrot sampling functions
//==============================================================================
  function collectEscapedCoords(renderer, buffer, results, colorFlags, options) {
    var n = 0;
    for(var i = 0; i < buffer.image.data.length; i += 4) {
      if(results.image.data[i + 2].between(options.ESCAPE_RANGE[0], options.ESCAPE_RANGE[1], true)) {
        for(var j = 0; j < 4; ++j) {
          buffer.image.data[n + j] = buffer.image.data[i + j];
        }
        for(var j = 0; j < 3; ++j) {
          colorFlags[n + j] = results.image.data[i + 2].between(options.COLOR_RANGES[j][0], options.COLOR_RANGES[j][1], true, true);
        }
        n += 4;
      }
    }
    //There's bad luck case when all our samples are within the mandelbrot set...
    if(n) {
      buffer.needsUpdate = true;
    }
    return n;
  }

  function sampleCoords(regions, buffer, options, a, b) {
    a = a || 0;
    b = b || options.SAMPLE_SIZE;

    for(var i = a; i < b; ++i) {
      //var r = Math.sqrt(options.rng.genrand_real1());
      //var phi = 2. * Math.PI * options.rng.genrand_real1();

      //buffer.image.data[i * 4] = Math.cos(phi) * r * 2.;
      //buffer.image.data[i * 4 + 1] = Math.sin(phi) * r * 2.;

      var idx = Math.floor(options.rng.genrand_real1() * regions.length * 0.5);
      //Real, imaginary
      buffer.image.data[i * 4] = regions[2 * idx] + options.JITTER_SIZE * options.rng.genrand_real1();
      buffer.image.data[i * 4 + 1] = regions[2 * idx + 1] + options.JITTER_SIZE * options.rng.genrand_real1();

      buffer.image.data[i * 4 + 2] = i;
      buffer.image.data[i * 4 + 3] = 0.;
    }
    buffer.needsUpdate = true;
  }

//==============================================================================
//Event functions
//==============================================================================

  function resize(w, h) {
    $canv.css({'margin-left': -w * 0.5, 'margin-top': -h * 0.5});

    renderer.setSize(w, h);

    if(bufferedTexImage.value) {
      bufferedTexImage.value.dispose();
    }
    bufferedTexImage.value = new THREE.DataTexture(new Float32Array(w * h * 4), w, h, THREE.RGBAFormat, THREE.FloatType);
    bufferedTexImage.value.needsUpdate = true;
  }

//==============================================================================
//Helper functions
//==============================================================================
  //Add +1 to the floor of the sampled pixel coordinate.  return max(max intensity, max).
  function accumulate(buffer, options, coord, max, colorFlags, n) {
    var bufImg = buffer.image;

    /* Perform the inverse of the preprocess shader to map to pixel coords.
     * Basic mapping from normalized coordinate to pixel coordinate
     * shenannigans.

     * pX is slightly simplified by multiplying into 
     * bufImg.width * (bufImg.height / bufImage.width * ... + 1.) * 0.5
     */
    var pX = (bufImg.height * (coord[0] - options.TRANSLATE.x) / options.SCALE + bufImg.width) * 0.5;
    var pY = bufImg.height * ((-coord[1] + options.TRANSLATE.y) / options.SCALE + 1.) * 0.5;

    var index = dataIndex(buffer, Math.floor(pX), Math.floor(pY), 4);

    if(index >= 0 && index < bufImg.data.length) {
      buffer.needsUpdate = true;
      for(var i = 0; i < 3; ++i) {
        var maxI = String.fromCharCode(120 + i);
        if(colorFlags[n + i]) {
          bufImg.data[index + i] += 2.;
          max[maxI] = Math.max(bufImg.data[index + i], max[maxI]);
        }
      }
    }

    return max;
  }

  function dataIndex(buffer, x, y, channels) {
    return (y * buffer.image.width + x) * channels;
  }

  function isInteresting(buffer, x, y, options) {
    for(var y_ = y - options.INTEREST_REGION_DELTA; y_ <= y + options.INTEREST_REGION_DELTA; ++y_) {
      for(var x_ = x - options.INTEREST_REGION_DELTA; x_ <= x + options.INTEREST_REGION_DELTA; ++x_) {
        var index = dataIndex(buffer, x_, y_, 4);
        if(between(buffer.image.data[index + 2],
            //Have to be careful, because what was sampled could have Goldilocks regions nearby that were missed because of the granularity of the preprocess sampling (which is honestly not that great)
            //12, options.ESCAPE_RANGE[1], true, true
            Math.min(100, options.ESCAPE_RANGE[0]), Math.min(options.ESCAPE_RANGE[1], 4000.), true, false
        )) {
          return true;
        }
      }
    }
    return false;
  }

  //Once I sample a normal mandelbrot, I can choose 'regions of interest.' These are regions <delta> pixels away from regions with escape iterations within options.ESCAPE_RANGE.
  function getSamplingRegions(buffer, options) {
    var indices = [];
    for(var y = 0; y < options.PREPROCESS_SIZE; ++y) {
      for(var x = 0; x < options.PREPROCESS_SIZE; ++x) {
        if(isInteresting(buffer, x, y, options)) {
          indices.push(dataIndex(buffer, x, y, 4));
        }
      }
    }

    var regions = new Float32Array(2 * indices.length);
    for(var i in indices) {
      regions[i * 2] = buffer.image.data[indices[i]];
      regions[i * 2 + 1] = buffer.image.data[indices[i] + 1];
    }

    return regions;
  }
})();
