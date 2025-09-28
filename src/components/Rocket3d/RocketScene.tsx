import type { RefObject } from "react";
import { Suspense, createRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RocketModel } from "./RocketModel";
import { Sphere, Environment, Html } from "@react-three/drei";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

import * as THREE from "three";

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
    () => new UnrealBloomPass(new THREE.Vector2(1, 1), 0.125, 0, 0),
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
  position: THREE.Vector3Like = new THREE.Vector3(),
  elapsedShift: number = 0,
  key = "main"
) => {
  const groupRef = createRef<THREE.Mesh>();
  const meshRef = createRef<THREE.Mesh>();
  const component = (
    <group key={key} position={new THREE.Vector3(0, -3, 0).add(position)}>
      <pointLight
        distance={1}
        color={[1, 0.15, 0.05]}
        intensity={100}
        position={[0, 1.5, 0]}
      />
      <group ref={groupRef} scale={[1, 8, 1]}>
        <Sphere args={[0.25, 8, 25]} ref={meshRef}>
          <meshBasicMaterial
            color={new THREE.Color(1, 0.15, 0.05).multiplyScalar(40)}
            opacity={0.5}
            transparent={true}
          />
        </Sphere>
      </group>
    </group>
  );
  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime() + elapsedShift;
    const { current } = groupRef;
    if (current) {
      const scale1 = Math.sin(elapsedTime * 80 + 0.2) * 0.025;
      const scale2 = Math.sin(elapsedTime * 10) * 0.02;
      current.scale.x = 0.5 + scale1 + scale2;
      current.scale.z = 0.5 + scale1 + scale2;
    }
  });
  return { meshRef, component };
};

export const RocketScene = () => {
  const rocketRef = createRef<THREE.Mesh>();
  const { size } = useThree();
  const aspect = size.height / size.width;

  useFrame(() => {
    if (rocketRef.current) {
      rocketRef.current.rotation.y += 0.0015;
    }
  });

  //Window inner width is not affected by scrollbar.  It is needed to match css @media.
  const rocketTransformProps: Record<string, [number, number, number]> =
    window.innerWidth >= 1024
      ? {
          position: [1, -0.5, 1.1 / Math.max(1.5 * aspect, 1)],
          rotation: [-0.2, 0.3, -0.7 / Math.max(1.5 * aspect, 1)],
        }
      : {
          position: [0, 0, -1],
          rotation: [0, 0, 0],
        };

  const envRotation: [number, number, number] = [
    (-80 * Math.PI) / 180,
    (10 * Math.PI) / 180,
    (0 * Math.PI) / 180,
  ];
  const environment = (
    <Environment
      backgroundRotation={envRotation}
      files="orbital.hdr"
      path="/scenes3d/env-maps/"
      environmentIntensity={1}
      environmentRotation={envRotation}
    />
  );
  const fumes = [
    useFume(),
    useFume({ x: 0.2830262780189514, y: 0, z: -0.1837994009256363 }, 0.05, "a"),
    useFume({ x: -0.2830262780189514, y: 0, z: 0.1837994009256363 }, 0.1, "b"),
    useFume({ z: 0.2830262780189514, y: 0, x: 0.1837994009256363 }, 0.15, "c"),
    useFume({ z: -0.2830262780189514, y: 0, x: -0.1837994009256363 }, 0.2, "d"),
  ];
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
        <directionalLight
          color="white"
          intensity={10}
          position={[0, 15, -4]}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <group {...rocketTransformProps}>
          <pointLight
            color={[1, 0.15, 0.05]}
            intensity={10000}
            position={[0, -9, 0]}
          />
          <group ref={rocketRef}>
            {fumes.map(({ component }) => component)}
            <RocketModel />
          </group>
        </group>
        <BloomEffects selection={fumes.map(({ meshRef }) => meshRef)} />
      </Suspense>
    </>
  );
};
