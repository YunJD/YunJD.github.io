import type { RefObject } from "react";
import { Suspense, createRef, useEffect, useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RocketModel } from "./RocketModel";
import { Cylinder, Environment, Html, useTexture } from "@react-three/drei";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import * as THREE from "three";

const FUME_COLOR: [number, number, number] = [1, 0.1, 0.05];
const FUMES_HEIGHT = 4;

const fumesUV = `
vUv * vec2(1., mix(0.3, 0.1, intensity) + 0.05 * pow(vUv.y, 4.)) + 
vec2(-0.3 * pow(vUv.y, 10.), fract(time * 0.1))
`;
const FUME_VERT_SHADER = `
varying vec2 vUv;
uniform float height;
uniform float time;
uniform sampler2D fumesLong;
uniform float intensity;

void main() {

  vUv = uv;
  float reversedY = (1. - vUv.y);
  float fumesValue = texture2D(fumesLong, 
${fumesUV}
  ).y;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(
    vec3(
      position.x,
      position.y,
      position.z
    ) + normal * (
      fumesValue * pow(reversedY, 2.) * 5. +
      fumesValue * sqrt(reversedY) * 3. +
      reversedY * mix(5., 25., intensity)
    ),
    1.
  );
}
`;

const FUME_FRAG_SHADER = `
varying vec2 vUv;
uniform float time;
uniform sampler2D fumesLong;
uniform float intensity;

void main() {
  float fumesValue = texture2D(
    fumesLong,
${fumesUV}
  ).y;
  float fumesContrast = clamp(1.1 * (fumesValue - 0.05), 0., 1.);
  vec3 topColor = mix(
    vec3(1., 0.15, 0.0),
    vec3(1., 0.1, 0.),
    clamp(vUv.y / 0.5 - 0.5, 0., 1.)
  );
  vec3 bottomColor = vec3(0.01, 0.01, 0.015);
  vec3 baseColor = max(
    mix(
      bottomColor,
      topColor * 20.,
      clamp(
        pow(vUv.y, 7.) * pow(2. * fumesContrast, 2.),
        0., 1.
      )
    ),
    0.
  );
  gl_FragColor = vec4(
    baseColor,
    clamp(
      pow(fumesContrast, 2.) + 
      max(0., (vUv.y - 0.93) * 10.) + // Tiny amount at the top
      pow(fumesContrast, 3.) * 
      pow(max(0., 5. * (vUv.y - 0.45)), 4.),
      0., 1.
    ) * min(vUv.y * mix(2., 5., intensity), 1.) // 0 to 1 opacity from 0 to 1 / 3 (the vUv.y coefficient)
  );
}
`;

const MIX_PASS_VERT_SHADER = `
varying vec2 vUv;

void main() {

    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}`;

const MIX_PASS_FRAG_SHADER = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;

varying vec2 vUv;

void main() {
  vec4 base = texture2D( baseTexture, vUv );
  vec4 bloom = texture2D( bloomTexture, vUv );
  bloom.a = max(bloom.r, max(bloom.g, bloom.b));
  gl_FragColor = (base + bloom);
}`;
const BloomEffects = ({
  selection,
}: {
  selection: RefObject<THREE.Mesh | null>[];
}) => {
  const { scene, gl, size, camera } = useThree();
  const invisibleMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "black",
        transparent: false,
        opacity: 1,
      }),
    []
  );
  const renderPass = useMemo(() => new RenderPass(scene, camera), []);
  const bloomPass = useMemo(
    () => new UnrealBloomPass(new THREE.Vector2(1, 1), 0.2, 0, 1),
    []
  );
  const outputPass = useMemo(() => new OutputPass(), []);
  const bloomComposer = useMemo(() => new EffectComposer(gl), [gl]);
  const mixPass = useMemo(
    () =>
      new ShaderPass(
        new THREE.ShaderMaterial({
          uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: bloomComposer.renderTarget2.texture },
          },
          vertexShader: MIX_PASS_VERT_SHADER,
          fragmentShader: MIX_PASS_FRAG_SHADER,
          defines: {},
        }),
        "baseTexture"
      ),
    []
  );

  const finalComposer = useMemo(() => new EffectComposer(gl), []);

  useEffect(() => {
    renderPass.clearAlpha = 0;
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderPass);
    bloomComposer.addPass(bloomPass);

    mixPass.needsSwap = true;
    finalComposer.addPass(renderPass);
    finalComposer.addPass(mixPass);
    finalComposer.addPass(outputPass);
  }, [renderPass, bloomComposer, finalComposer]);

  useEffect(() => {
    bloomComposer.setSize(size.width, size.height);
    finalComposer.setSize(size.width, size.height);
  }, [size]);

  useFrame(() => {
    const selectedObjs = selection
      .filter((obj) => obj.current)
      .map((obj) => obj.current);
    const originalMaterials: Record<
      string,
      {
        obj: THREE.Mesh | THREE.Points;
        material: THREE.Material;
      }
    > = {};
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        originalMaterials[obj.uuid] = { obj, material: obj.material };
        obj.material = invisibleMaterial;
      }
    });
    for (let selectedObj of selectedObjs) {
      if (!selectedObj?.uuid) {
        continue;
      }
      const { obj, material } = originalMaterials[selectedObj.uuid];
      obj.material = material;
    }
    bloomComposer.render();
    for (let { obj, material } of Object.values(originalMaterials)) {
      obj.material = material;
    }
    finalComposer.render();
  }, 1);
  return null;
};

const useFume = (
  fumesLongTex: THREE.Texture,
  position: THREE.Vector3Like = new THREE.Vector3(),
  elapsedShift: number = 0,
  key = "main"
) => {
  const meshRef = createRef<THREE.Mesh>();
  const fumesMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          intensity: { value: 0.5 },
          fumesLong: { value: fumesLongTex },
          time: { value: elapsedShift },
          height: { value: FUMES_HEIGHT },
        },
        defines: {},
        vertexShader: FUME_VERT_SHADER,
        fragmentShader: FUME_FRAG_SHADER,
      }),
    []
  );
  const component = (
    <group key={key} position={new THREE.Vector3(0, -1, 0).add(position)}>
      <group position={[0, -FUMES_HEIGHT * 0.5 - 0.7, 0]} scale={[0.2, 1, 0.2]}>
        <Cylinder
          material={fumesMaterial}
          args={[1.2, 1.2, FUMES_HEIGHT, 128, 128, true]}
          ref={meshRef}
        />
      </group>
    </group>
  );
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const deltaX = (1.5 * e.movementX) / window.innerWidth;
      fumesMaterial.uniforms.intensity.value = Math.min(
        1,
        Math.max(0, fumesMaterial.uniforms.intensity.value + deltaX)
      );
    };
    window.addEventListener("mousemove", handler);

    let lastTouchX: number | null = null;
    const touchHandler = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (lastTouchX !== null) {
          const deltaX =
            (1.5 * (touch.clientX - lastTouchX)) / window.innerWidth;
          fumesMaterial.uniforms.intensity.value = Math.min(
            1,
            Math.max(0, fumesMaterial.uniforms.intensity.value + deltaX)
          );
        }
        lastTouchX = touch.clientX;
      }
    };
    window.addEventListener("touchmove", touchHandler);
    window.addEventListener("touchend", () => {
      lastTouchX = null;
    });
    return () => {
      window.removeEventListener("mousemove", handler);
      window.removeEventListener("touchmove", touchHandler);
      window.removeEventListener("touchend", () => {
        lastTouchX = null;
      });
    };
  }, []);
  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime() + elapsedShift;
    if (fumesMaterial) {
      fumesMaterial.uniforms.time.value = elapsedTime;
    }
  });
  return { meshRef, component };
};

export const RocketScene = () => {
  const rocketRef = createRef<THREE.Mesh>();
  const { size } = useThree();
  const aspect = size.height / size.width;
  const mouseRotation = useMemo(() => ({ value: 1 }), []);

  useFrame(() => {
    if (rocketRef.current) {
      rocketRef.current.rotation.y += 0.005;
    }
  });
  const [verticalTransformMod, setVerticalTransformMod] = useState<number>(0.5);
  useEffect(() => {
    let lastTouchY: number | null = null;
    const mouseHandler = (e: MouseEvent) => {
      setVerticalTransformMod((oldValue) =>
        THREE.MathUtils.clamp(
          oldValue + (1.5 * e.movementY) / window.innerHeight,
          0,
          1
        )
      );
      mouseRotation.value = THREE.MathUtils.clamp(
        mouseRotation.value + (1.5 * e.movementY) / window.innerHeight,
        0,
        1
      );
    };
    const touchHandler = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touchY = e.touches[0].clientY;
        if (lastTouchY !== null) {
          const movementY = touchY - lastTouchY;
          setVerticalTransformMod((oldValue) =>
            THREE.MathUtils.clamp(
              oldValue + (1.5 * movementY) / window.innerHeight,
              0,
              1
            )
          );
          mouseRotation.value = THREE.MathUtils.clamp(
            mouseRotation.value + (1.5 * movementY) / window.innerHeight,
            0,
            1
          );
        }
        lastTouchY = touchY;
      }
    };
    const touchEndHandler = () => {
      lastTouchY = null;
    };
    window.addEventListener("mousemove", mouseHandler);
    window.addEventListener("touchmove", touchHandler);
    window.addEventListener("touchend", touchEndHandler);
    return () => {
      window.removeEventListener("mousemove", mouseHandler);
      window.removeEventListener("touchmove", touchHandler);
      window.removeEventListener("touchend", touchEndHandler);
    };
  }, [setVerticalTransformMod]);
  const verticalRotation = THREE.MathUtils.lerp(
    (-30 * Math.PI) / 180,
    (30 * Math.PI) / 180,
    verticalTransformMod
  );

  //Window inner width is not affected by scrollbar.  It is needed to match css @media.
  const rocketTransformProps: Record<string, [number, number, number]> =
    window.innerWidth >= 1024
      ? {
          position: [0.5, 0.25, -7.5],
          rotation: [
            -0.2 + verticalRotation,
            0.3,
            1.12 / Math.max(1.32 * aspect, 1),
          ],
        }
      : {
          position: [0, 0, -12],
          rotation: [verticalRotation, 0, 0],
        };

  const envRotation: [number, number, number] = [
    (-5 * Math.PI) / 180,
    (45 * Math.PI) / 180,
    (30 * Math.PI) / 180,
  ];
  const environment = (
    <Environment
      background
      backgroundIntensity={0.6}
      backgroundRotation={envRotation}
      files="orbital.hdr"
      path="/scenes3d/env-maps/"
      environmentIntensity={1}
      environmentRotation={envRotation}
    />
  );
  const fumesLongTex = useTexture(
    "/scenes3d/rocket/Fumes Long.png",
    (tex: THREE.Texture) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
    }
  );
  const fumes = [useFume(fumesLongTex)];
  return (
    <>
      <Suspense
        fallback={
          <Html>
            <div className="font-extrabold m-auto inline-block text-white">
              Loading...
            </div>
          </Html>
        }
      >
        {environment}
        <group {...rocketTransformProps}>
          <directionalLight
            color="white"
            intensity={3}
            position={[-8, 5, 12]}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight
            decay={2}
            color={FUME_COLOR}
            intensity={5000}
            position={[0, -12, 0]}
          />
          {fumes.map(({ component }) => component)}
          <group ref={rocketRef}>
            <RocketModel />
          </group>
        </group>
        <BloomEffects selection={fumes.map(({ meshRef }) => meshRef)} />
      </Suspense>
    </>
  );
};
