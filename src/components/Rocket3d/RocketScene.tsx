import type { RefObject } from "react";
import { Suspense, createRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RocketModel } from "./RocketModel";
import { Sphere, SoftShadows, Environment, Html } from "@react-three/drei";
import {
  UnrealBloomPass,
  RenderPass,
  ShaderPass,
  EffectComposer,
} from "three-stdlib";
import * as THREE from "three";

const FINAL_EFFECT_VERT_SHADER = `
varying vec2 vUv;

void main() {

    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}`;

const FINAL_EFFECT_FRAG_SHADER = `
uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;

varying vec2 vUv;

void main() {

    vec4 base = texture2D( baseTexture, vUv );
    vec4 bloom = texture2D( bloomTexture, vUv );
    bloom.a = max(bloom.b, max(bloom.r, bloom.g));
    gl_FragColor = base + bloom;
}`;
const BloomEffects = ({ selection }: { selection: RefObject<THREE.Mesh> }) => {
  const { scene, gl, size, camera } = useThree();
  const invisibleMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "black",
        transparent: true,
        opacity: 0,
      }),
    []
  );
  const renderPass = useMemo(() => new RenderPass(scene, camera), []);
  const bloomPass = useMemo(
    () => new UnrealBloomPass(new THREE.Vector2(0, 0), 3, 1, 0),
    []
  );
  const bloomComposer = useMemo(() => new EffectComposer(gl), []);
  const finalPass = useMemo(
    () =>
      new ShaderPass(
        new THREE.ShaderMaterial({
          uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: bloomComposer.renderTarget2.texture },
          },
          vertexShader: FINAL_EFFECT_VERT_SHADER,
          fragmentShader: FINAL_EFFECT_FRAG_SHADER,
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

    finalPass.needsSwap = true;
    finalComposer.addPass(renderPass);
    finalComposer.addPass(finalPass);
  }, []);

  useEffect(() => {
    bloomComposer.setSize(size.width, size.height);
    finalComposer.setSize(size.width, size.height);
  }, [size]);

  useFrame(() => {
    const originalMaterials = {};
    scene.traverse((obj) => {
      if (obj.isMesh || obj.isPoints) {
        originalMaterials[obj.uuid] = obj.material;
        obj.material = invisibleMaterial;
      }
    });
    for (let objRef of selection) {
      const obj = objRef.current;
      obj.material = originalMaterials[obj.uuid];
    }
    bloomComposer.render();
    scene.traverse((obj) => {
      if (originalMaterials[obj.uuid]) {
        obj.material = originalMaterials[obj.uuid];
        delete originalMaterials[obj.uuid];
      }
    });
    finalComposer.render();
  }, 1);
  return null;
};

export const RocketScene = () => {
  const rocketRef = createRef<THREE.Mesh>();
  const starsRef = createRef<THREE.Mesh>();
  const fumesRef = createRef<THREE.Mesh>();
  const fumesMeshRef = createRef<THREE.Mesh>();
  const { size } = useThree();
  const aspect = size.height / size.width;

  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime();
    const { current } = fumesRef;
    if (current) {
      const scale1 = Math.sin(elapsedTime * 80 + 0.2) * 0.025;
      const scale2 = Math.sin(elapsedTime * 10) * 0.02;
      current.scale.x = 0.5 + scale1 + scale2;
      current.scale.z = 0.5 + scale1 + scale2;
    }
    if (rocketRef.current) {
      rocketRef.current.rotation.y += 0.0015;
    }
    if (starsRef.current) {
      starsRef.current.rotation.x = 0.0001;
      starsRef.current.rotation.y -= 0.0001;
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
  return (
    <>
      <SoftShadows />
      <Suspense
        fallback={
          <Html>
            <div className="font-extrabold text-center inline-block bg-primary-900/60 text-white backdrop-blur mb-14 px-5 py-4 rounded-xl">
              Loading...
            </div>
          </Html>
        }
      >
        <Environment
          background={false}
          files="industrial_sunset_lowres.hdr"
          path="/scenes3d/env-maps/"
        />
        <pointLight intensity={1} position={[-20, -30, 530]} color="#11aaee" />
        <pointLight intensity={1} position={[100, 50, 10]} color="#11aaee" />
        <directionalLight
          color="#ff3311"
          intensity={30}
          position={[-100, -100, -200]}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight
          color="#ff3311"
          intensity={20}
          position={[-500, 900, -400]}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <group {...rocketTransformProps}>
          <RocketModel ref={rocketRef} />
          <group ref={fumesRef} position={[0, -2, 0]} scale={[1, 8, 1]}>
            <Sphere args={[0.5, 8, 25]} ref={fumesMeshRef}>
              <meshBasicMaterial
                color="#ff5544"
                opacity={1}
                transparent={true}
              />
            </Sphere>
          </group>
        </group>
        <BloomEffects selection={[fumesMeshRef]} />
      </Suspense>
    </>
  );
};
