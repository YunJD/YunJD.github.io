import type { RefObject } from "react";
import { Suspense, createRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RocketModel } from "./RocketModel";
import { Cylinder, Environment, Html } from "@react-three/drei";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

import * as THREE from "three";

const FUME_VERT_SHADER = `
varying vec2 vUv;
uniform float height;
uniform float time;

void main() {

    vUv = uv;
    float reversedY = (1. - vUv.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(
      vec3(
        position.x,
        position.y,
        position.z
      ) + 
       normal * reversedY * sin(time + vUv.y * 6.28 * 8.) * 0.2 + 
       normal * reversedY * 10.
      ,
      1.
    );
}
`;

const FUME_FRAG_SHADER = `
varying vec2 vUv;
void main() {
  gl_FragColor = vec4(vec3(1., 0.3, 0.1) * 3., pow(vUv.y, 3.));
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
    () => new UnrealBloomPass(new THREE.Vector2(1, 1), 0.3, 0, 0),
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
  const meshRef = createRef<THREE.Mesh>();
  const fumeHeight = 2;
  const fumeShaderRef = createRef<THREE.ShaderMaterial>();
  const component = (
    <group key={key} position={new THREE.Vector3(0, -1, 0).add(position)}>
      <pointLight
        distance={1.1}
        position={[0, -0.1, 0]}
        color={[1, 0.15, 0.05]}
        intensity={100}
      />
      <group position={[0, -fumeHeight * 0.5 - 0.5, 0]} scale={[0.2, 1, 0.2]}>
        <Cylinder args={[0.6, 0.6, fumeHeight, 24, 32, true]} ref={meshRef}>
          <shaderMaterial
            ref={fumeShaderRef}
            uniforms={{
              time: { value: 1.0 },
              height: { value: fumeHeight },
            }}
            transparent
            vertexShader={FUME_VERT_SHADER}
            fragmentShader={FUME_FRAG_SHADER}
          />
        </Cylinder>
      </group>
    </group>
  );
  useFrame((state) => {
    const elapsedTime = state.clock.getElapsedTime() + elapsedShift;
    if (fumeShaderRef.current) {
      fumeShaderRef.current.uniforms.time.value = elapsedTime * 80;
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
    useFume({ x: -0.33, y: 0, z: 0 }, 0.05, "1"),
    useFume({ x: 0.33, y: 0, z: 0 }, 0.1, "2"),
    useFume({ z: -0.33, y: 0, x: 0 }, 0.15, "3"),
    useFume({ z: 0.33, y: 0, x: -0 }, 0.2, "4"),
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
