"use strict";(self.webpackChunkpersonal_website_yunjd=self.webpackChunkpersonal_website_yunjd||[]).push([[908],{1371:function(e,t,r){r.r(t),r.d(t,{default:function(){return k}});var i=r(3456),n=r(7294),a=r(9457),s=r(5671),o=r(3144),l={uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:"\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\tvUv = uv;\n\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n\t\t}",fragmentShader:"\n\n\t\tuniform float opacity;\n\n\t\tuniform sampler2D tDiffuse;\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\tvec4 texel = texture2D( tDiffuse, vUv );\n\t\t\tgl_FragColor = opacity * texel;\n\n\t\t}"},u=r(136),c=r(6215),h=r(1120),f=function(){function e(){(0,s.Z)(this,e),this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}return(0,o.Z)(e,[{key:"setSize",value:function(){}},{key:"render",value:function(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}}]),e}(),d=new i.OrthographicCamera(-1,1,1,-1,0,1),m=new i.BufferGeometry;m.setAttribute("position",new i.Float32BufferAttribute([-1,3,0,-1,-1,0,3,-1,0],3)),m.setAttribute("uv",new i.Float32BufferAttribute([0,2,0,0,2,0],2));var v=function(){function e(t){(0,s.Z)(this,e),this._mesh=new i.Mesh(m,t)}return(0,o.Z)(e,[{key:"dispose",value:function(){this._mesh.geometry.dispose()}},{key:"render",value:function(e){e.render(this._mesh,d)}},{key:"material",get:function(){return this._mesh.material},set:function(e){this._mesh.material=e}}]),e}();function p(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var r,i=(0,h.Z)(e);if(t){var n=(0,h.Z)(this).constructor;r=Reflect.construct(i,arguments,n)}else r=i.apply(this,arguments);return(0,c.Z)(this,r)}}var g=function(e){(0,u.Z)(r,e);var t=p(r);function r(e,n){var a;return(0,s.Z)(this,r),(a=t.call(this)).textureID=void 0!==n?n:"tDiffuse",e instanceof i.ShaderMaterial?(a.uniforms=e.uniforms,a.material=e):e&&(a.uniforms=i.UniformsUtils.clone(e.uniforms),a.material=new i.ShaderMaterial({defines:Object.assign({},e.defines),uniforms:a.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),a.fsQuad=new v(a.material),a}return(0,o.Z)(r,[{key:"render",value:function(e,t,r){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=r.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}}]),r}(f);function x(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var r,i=(0,h.Z)(e);if(t){var n=(0,h.Z)(this).constructor;r=Reflect.construct(i,arguments,n)}else r=i.apply(this,arguments);return(0,c.Z)(this,r)}}var T=function(e){(0,u.Z)(r,e);var t=x(r);function r(e,i){var n;return(0,s.Z)(this,r),(n=t.call(this)).scene=e,n.camera=i,n.clear=!0,n.needsSwap=!1,n.inverse=!1,n}return(0,o.Z)(r,[{key:"render",value:function(e,t,r){var i,n,a=e.getContext(),s=e.state;s.buffers.color.setMask(!1),s.buffers.depth.setMask(!1),s.buffers.color.setLocked(!0),s.buffers.depth.setLocked(!0),this.inverse?(i=0,n=1):(i=1,n=0),s.buffers.stencil.setTest(!0),s.buffers.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),s.buffers.stencil.setFunc(a.ALWAYS,i,4294967295),s.buffers.stencil.setClear(n),s.buffers.stencil.setLocked(!0),e.setRenderTarget(r),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),s.buffers.color.setLocked(!1),s.buffers.depth.setLocked(!1),s.buffers.stencil.setLocked(!1),s.buffers.stencil.setFunc(a.EQUAL,1,4294967295),s.buffers.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),s.buffers.stencil.setLocked(!0)}}]),r}(f),b=function(e){(0,u.Z)(r,e);var t=x(r);function r(){var e;return(0,s.Z)(this,r),(e=t.call(this)).needsSwap=!1,e}return(0,o.Z)(r,[{key:"render",value:function(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}]),r}(f),y=function(){function e(t,r){if((0,s.Z)(this,e),this.renderer=t,void 0===r){var n={minFilter:i.LinearFilter,magFilter:i.LinearFilter,format:i.RGBAFormat},a=t.getSize(new i.Vector2);this._pixelRatio=t.getPixelRatio(),this._width=a.width,this._height=a.height,(r=new i.WebGLRenderTarget(this._width*this._pixelRatio,this._height*this._pixelRatio,n)).texture.name="EffectComposer.rt1"}else this._pixelRatio=1,this._width=r.width,this._height=r.height;this.renderTarget1=r,this.renderTarget2=r.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],void 0===l&&console.error("THREE.EffectComposer relies on CopyShader"),void 0===g&&console.error("THREE.EffectComposer relies on ShaderPass"),this.copyPass=new g(l),this.clock=new i.Clock}return(0,o.Z)(e,[{key:"swapBuffers",value:function(){var e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}},{key:"addPass",value:function(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}},{key:"insertPass",value:function(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}},{key:"removePass",value:function(e){var t=this.passes.indexOf(e);-1!==t&&this.passes.splice(t,1)}},{key:"isLastEnabledPass",value:function(e){for(var t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}},{key:"render",value:function(e){void 0===e&&(e=this.clock.getDelta());for(var t=this.renderer.getRenderTarget(),r=!1,i=0,n=this.passes.length;i<n;i++){var a=this.passes[i];if(!1!==a.enabled){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,r),a.needsSwap){if(r){var s=this.renderer.getContext(),o=this.renderer.state.buffers.stencil;o.setFunc(s.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),o.setFunc(s.EQUAL,1,4294967295)}this.swapBuffers()}void 0!==T&&(a instanceof T?r=!0:a instanceof b&&(r=!1))}}this.renderer.setRenderTarget(t)}},{key:"reset",value:function(e){if(void 0===e){var t=this.renderer.getSize(new i.Vector2);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,(e=this.renderTarget1.clone()).setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}},{key:"setSize",value:function(e,t){this._width=e,this._height=t;var r=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(r,i),this.renderTarget2.setSize(r,i);for(var n=0;n<this.passes.length;n++)this.passes[n].setSize(r,i)}},{key:"setPixelRatio",value:function(e){this._pixelRatio=e,this.setSize(this._width,this._height)}}]),e}(),C=(new i.OrthographicCamera(-1,1,1,-1,0,1),new i.BufferGeometry);C.setAttribute("position",new i.Float32BufferAttribute([-1,3,0,-1,-1,0,3,-1,0],3)),C.setAttribute("uv",new i.Float32BufferAttribute([0,2,0,0,2,0],2));function S(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var r,i=(0,h.Z)(e);if(t){var n=(0,h.Z)(this).constructor;r=Reflect.construct(i,arguments,n)}else r=i.apply(this,arguments);return(0,c.Z)(this,r)}}var M=function(e){(0,u.Z)(r,e);var t=S(r);function r(e,n,a,o,l){var u;return(0,s.Z)(this,r),(u=t.call(this)).scene=e,u.camera=n,u.overrideMaterial=a,u.clearColor=o,u.clearAlpha=void 0!==l?l:0,u.clear=!0,u.clearDepth=!1,u.needsSwap=!1,u._oldClearColor=new i.Color,u}return(0,o.Z)(r,[{key:"render",value:function(e,t,r){var i,n,a=e.autoClear;e.autoClear=!1,void 0!==this.overrideMaterial&&(n=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor&&(e.getClearColor(this._oldClearColor),i=e.getClearAlpha(),e.setClearColor(this.clearColor,this.clearAlpha)),this.clearDepth&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:r),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor&&e.setClearColor(this._oldClearColor,i),void 0!==this.overrideMaterial&&(this.scene.overrideMaterial=n),e.autoClear=a}}]),r}(f),w={shaderID:"luminosityHighPass",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new i.Color(0)},defaultOpacity:{value:0}},vertexShader:"\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\tvUv = uv;\n\n\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n\t\t}",fragmentShader:"\n\n\t\tuniform sampler2D tDiffuse;\n\t\tuniform vec3 defaultColor;\n\t\tuniform float defaultOpacity;\n\t\tuniform float luminosityThreshold;\n\t\tuniform float smoothWidth;\n\n\t\tvarying vec2 vUv;\n\n\t\tvoid main() {\n\n\t\t\tvec4 texel = texture2D( tDiffuse, vUv );\n\n\t\t\tvec3 luma = vec3( 0.299, 0.587, 0.114 );\n\n\t\t\tfloat v = dot( texel.xyz, luma );\n\n\t\t\tvec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );\n\n\t\t\tfloat alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );\n\n\t\t\tgl_FragColor = mix( outputColor, texel, alpha );\n\n\t\t}"};function R(e){var t=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}();return function(){var r,i=(0,h.Z)(e);if(t){var n=(0,h.Z)(this).constructor;r=Reflect.construct(i,arguments,n)}else r=i.apply(this,arguments);return(0,c.Z)(this,r)}}var B=function(e){(0,u.Z)(r,e);var t=R(r);function r(e,n,a,o){var u;(0,s.Z)(this,r),(u=t.call(this)).strength=void 0!==n?n:1,u.radius=a,u.threshold=o,u.resolution=void 0!==e?new i.Vector2(e.x,e.y):new i.Vector2(256,256),u.clearColor=new i.Color(0,0,0);var c={minFilter:i.LinearFilter,magFilter:i.LinearFilter,format:i.RGBAFormat};u.renderTargetsHorizontal=[],u.renderTargetsVertical=[],u.nMips=5;var h=Math.round(u.resolution.x/2),f=Math.round(u.resolution.y/2);u.renderTargetBright=new i.WebGLRenderTarget(h,f,c),u.renderTargetBright.texture.name="UnrealBloomPass.bright",u.renderTargetBright.texture.generateMipmaps=!1;for(var d=0;d<u.nMips;d++){var m=new i.WebGLRenderTarget(h,f,c);m.texture.name="UnrealBloomPass.h"+d,m.texture.generateMipmaps=!1,u.renderTargetsHorizontal.push(m);var p=new i.WebGLRenderTarget(h,f,c);p.texture.name="UnrealBloomPass.v"+d,p.texture.generateMipmaps=!1,u.renderTargetsVertical.push(p),h=Math.round(h/2),f=Math.round(f/2)}void 0===w&&console.error("THREE.UnrealBloomPass relies on LuminosityHighPassShader");var g=w;u.highPassUniforms=i.UniformsUtils.clone(g.uniforms),u.highPassUniforms.luminosityThreshold.value=o,u.highPassUniforms.smoothWidth.value=.01,u.materialHighPassFilter=new i.ShaderMaterial({uniforms:u.highPassUniforms,vertexShader:g.vertexShader,fragmentShader:g.fragmentShader,defines:{}}),u.separableBlurMaterials=[];var x=[3,5,7,9,11];h=Math.round(u.resolution.x/2),f=Math.round(u.resolution.y/2);for(var T=0;T<u.nMips;T++)u.separableBlurMaterials.push(u.getSeperableBlurMaterial(x[T])),u.separableBlurMaterials[T].uniforms.texSize.value=new i.Vector2(h,f),h=Math.round(h/2),f=Math.round(f/2);u.compositeMaterial=u.getCompositeMaterial(u.nMips),u.compositeMaterial.uniforms.blurTexture1.value=u.renderTargetsVertical[0].texture,u.compositeMaterial.uniforms.blurTexture2.value=u.renderTargetsVertical[1].texture,u.compositeMaterial.uniforms.blurTexture3.value=u.renderTargetsVertical[2].texture,u.compositeMaterial.uniforms.blurTexture4.value=u.renderTargetsVertical[3].texture,u.compositeMaterial.uniforms.blurTexture5.value=u.renderTargetsVertical[4].texture,u.compositeMaterial.uniforms.bloomStrength.value=n,u.compositeMaterial.uniforms.bloomRadius.value=.1,u.compositeMaterial.needsUpdate=!0;u.compositeMaterial.uniforms.bloomFactors.value=[1,.8,.6,.4,.2],u.bloomTintColors=[new i.Vector3(1,1,1),new i.Vector3(1,1,1),new i.Vector3(1,1,1),new i.Vector3(1,1,1),new i.Vector3(1,1,1)],u.compositeMaterial.uniforms.bloomTintColors.value=u.bloomTintColors,void 0===l&&console.error("THREE.UnrealBloomPass relies on CopyShader");var b=l;return u.copyUniforms=i.UniformsUtils.clone(b.uniforms),u.copyUniforms.opacity.value=1,u.materialCopy=new i.ShaderMaterial({uniforms:u.copyUniforms,vertexShader:b.vertexShader,fragmentShader:b.fragmentShader,blending:i.AdditiveBlending,depthTest:!1,depthWrite:!1,transparent:!0}),u.enabled=!0,u.needsSwap=!1,u._oldClearColor=new i.Color,u.oldClearAlpha=1,u.basic=new i.MeshBasicMaterial,u.fsQuad=new v(null),u}return(0,o.Z)(r,[{key:"dispose",value:function(){for(var e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(var t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose()}},{key:"setSize",value:function(e,t){var r=Math.round(e/2),n=Math.round(t/2);this.renderTargetBright.setSize(r,n);for(var a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(r,n),this.renderTargetsVertical[a].setSize(r,n),this.separableBlurMaterials[a].uniforms.texSize.value=new i.Vector2(r,n),r=Math.round(r/2),n=Math.round(n/2)}},{key:"render",value:function(e,t,i,n,a){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();var s=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),a&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=i.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);for(var o=this.renderTargetBright,l=0;l<this.nMips;l++)this.fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=r.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=r.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this.fsQuad.render(e),o=this.renderTargetsVertical[l];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.materialCopy,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(i),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=s}},{key:"getSeperableBlurMaterial",value:function(e){return new i.ShaderMaterial({defines:{KERNEL_RADIUS:e,SIGMA:e},uniforms:{colorTexture:{value:null},texSize:{value:new i.Vector2(.5,.5)},direction:{value:new i.Vector2(.5,.5)}},vertexShader:"varying vec2 vUv;\n\t\t\t\tvoid main() {\n\t\t\t\t\tvUv = uv;\n\t\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\t\t\t\t}",fragmentShader:"#include <common>\n\t\t\t\tvarying vec2 vUv;\n\t\t\t\tuniform sampler2D colorTexture;\n\t\t\t\tuniform vec2 texSize;\n\t\t\t\tuniform vec2 direction;\n\n\t\t\t\tfloat gaussianPdf(in float x, in float sigma) {\n\t\t\t\t\treturn 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;\n\t\t\t\t}\n\t\t\t\tvoid main() {\n\t\t\t\t\tvec2 invSize = 1.0 / texSize;\n\t\t\t\t\tfloat fSigma = float(SIGMA);\n\t\t\t\t\tfloat weightSum = gaussianPdf(0.0, fSigma);\n\t\t\t\t\tvec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;\n\t\t\t\t\tfor( int i = 1; i < KERNEL_RADIUS; i ++ ) {\n\t\t\t\t\t\tfloat x = float(i);\n\t\t\t\t\t\tfloat w = gaussianPdf(x, fSigma);\n\t\t\t\t\t\tvec2 uvOffset = direction * invSize * x;\n\t\t\t\t\t\tvec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;\n\t\t\t\t\t\tvec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;\n\t\t\t\t\t\tdiffuseSum += (sample1 + sample2) * w;\n\t\t\t\t\t\tweightSum += 2.0 * w;\n\t\t\t\t\t}\n\t\t\t\t\tgl_FragColor = vec4(diffuseSum/weightSum, 1.0);\n\t\t\t\t}"})}},{key:"getCompositeMaterial",value:function(e){return new i.ShaderMaterial({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},dirtTexture:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:"varying vec2 vUv;\n\t\t\t\tvoid main() {\n\t\t\t\t\tvUv = uv;\n\t\t\t\t\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\t\t\t\t}",fragmentShader:"varying vec2 vUv;\n\t\t\t\tuniform sampler2D blurTexture1;\n\t\t\t\tuniform sampler2D blurTexture2;\n\t\t\t\tuniform sampler2D blurTexture3;\n\t\t\t\tuniform sampler2D blurTexture4;\n\t\t\t\tuniform sampler2D blurTexture5;\n\t\t\t\tuniform sampler2D dirtTexture;\n\t\t\t\tuniform float bloomStrength;\n\t\t\t\tuniform float bloomRadius;\n\t\t\t\tuniform float bloomFactors[NUM_MIPS];\n\t\t\t\tuniform vec3 bloomTintColors[NUM_MIPS];\n\n\t\t\t\tfloat lerpBloomFactor(const in float factor) {\n\t\t\t\t\tfloat mirrorFactor = 1.2 - factor;\n\t\t\t\t\treturn mix(factor, mirrorFactor, bloomRadius);\n\t\t\t\t}\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tgl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +\n\t\t\t\t\t\tlerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +\n\t\t\t\t\t\tlerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +\n\t\t\t\t\t\tlerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +\n\t\t\t\t\t\tlerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );\n\t\t\t\t}"})}}]),r}(f);function _(e){var t=e.geometry,r=e.x,i=e.y,s=e.z,o=e.s,l=(0,n.useRef)();return(0,a.xQ)((function(e){l.current.position.x=r+Math.sin(e.clock.getElapsedTime()*o/2),l.current.position.y=i+Math.sin(e.clock.getElapsedTime()*o/2),l.current.position.z=s+Math.sin(e.clock.getElapsedTime()*o/2)})),n.createElement("mesh",{ref:l,position:[r,i,s],scale:[o,o,o],geometry:t},n.createElement("meshStandardMaterial",{color:"hotpink",roughness:1}))}function E(){var e=(0,n.useState)((function(){return new i.SphereGeometry(1,32,32)}),[])[0];return(0,n.useMemo)((function(){return new Array(15).fill().map((function(e,t){return{x:100*Math.random()-50,y:100*Math.random()-50,z:100*Math.random()-50,s:Math.random()+10}}))}),[]).map((function(t,r){return n.createElement(_,Object.assign({key:r},t,{geometry:e}))}))}function U(e){var t=e.children,r=(0,a.Ky)(),i=r.gl,s=r.camera,o=r.size,l=(0,n.useState)(),u=l[0],c=l[1],h=(0,n.useRef)();return(0,n.useEffect)((function(){}),[o]),(0,a.xQ)((function(){return u&&h.current.render()}),1),n.createElement(n.Fragment,null,n.createElement("scene",{ref:c},t),n.createElement("effectComposer",{ref:h,args:[i]},n.createElement("renderPass",{attachArray:"passes",scene:u,camera:s}),n.createElement("unrealBloomPass",{attachArray:"passes",args:[void 0,1.5,1,0]})))}function P(e){var t=e.children,r=(0,n.useRef)(),i=(0,a.Ky)(),s=i.gl,o=i.camera;return(0,a.xQ)((function(){s.autoClear=!1,s.clearDepth(),s.render(r.current,o)}),2),n.createElement("scene",{ref:r},t)}B.BlurDirectionX=new i.Vector2(1,0),B.BlurDirectionY=new i.Vector2(0,1),(0,a.l7)({EffectComposer:y,RenderPass:M,UnrealBloomPass:B});var k=function(){return n.createElement("div",{className:"w-screen h-screen"},n.createElement(a.Xz,{linear:!0,camera:{position:[0,0,120]}},n.createElement(P,null,n.createElement("pointLight",null),n.createElement("ambientLight",null),n.createElement(E,null)),n.createElement(U,null,n.createElement("ambientLight",null),n.createElement(E,null))))}}}]);
//# sourceMappingURL=component---src-pages-test-page-js-0d8fb567c18da33739c4.js.map