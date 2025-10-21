import { forwardRef, useEffect, useRef, type ReactElement } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

const EasyNodeToMesh = ({
  node,
  children,
}: {
  node: THREE.Mesh;
  children: ReactElement;
}) => (
  <mesh
    castShadow
    receiveShadow
    geometry={node.geometry}
    position={node.position}
    scale={node.scale}
    rotation={node.rotation}
  >
    {children}
  </mesh>
);

export const RocketModel = forwardRef((props, ref) => {
  const finAO = useTexture("/scenes3d/rocket/Fin AO.png", (tex) => {
    tex.flipY = false;
  });
  const finRoughnessMap = useTexture(
    "/scenes3d/rocket/Fin Roughness.png",
    (tex) => {
      tex.flipY = false;
    }
  );
  const bodyAO = useTexture("/scenes3d/rocket/Body AO.png", (tex) => {
    tex.flipY = false;
  });
  const bodyAnisotropyMap = useTexture(
    "/scenes3d/rocket/Body Anisotropy.png",
    (tex) => {
      tex.flipY = false;
    }
  );
  const bodyRoughnessMap = useTexture(
    "/scenes3d/rocket/Body Roughness.png",
    (tex) => {
      tex.flipY = false;
    }
  );
  const bodyRef = useRef(null);
  const rocket = useGLTF("/scenes3d/rocket/rocket.glb");
  const { nodes } = rocket;

  const recordNodes = nodes as Record<string, THREE.Mesh>;
  const {
    Engine,
    Rocket_body,
    Rocket_fin,
    Rocket_window_hatch,
    Rocket_frame_hatch,
    Rocket_window,
    Rocket_window_frame,
    Rocket_screws,
  } = recordNodes;
  const windowMaterial = (
    <meshPhysicalMaterial color="#555" metalness={1} roughness={0} ior={1.4} />
  );
  const windowFrameMaterial = (
    <meshPhysicalMaterial color="#999" metalness={1} roughness={0.2} />
  );
  useEffect(() => {
    Rocket_body.geometry.computeTangents();
  }, []);

  return (
    <group ref={ref} {...props} rotation={[0, Math.PI * 0.5, 0]}>
      <mesh
        receiveShadow
        castShadow
        ref={bodyRef}
        geometry={Rocket_body.geometry}
        position={Rocket_body.position}
        scale={Rocket_body.scale}
      >
        <meshPhysicalMaterial
          map={bodyAnisotropyMap}
          color="#fff"
          aoMap={bodyAO}
          aoMapIntensity={1}
          roughnessMap={bodyRoughnessMap}
          metalness={1}
          roughness={1}
          anisotropy={1}
          anisotropyMap={bodyAnisotropyMap}
          anisotropyRotation={0.25 * Math.PI}
          bumpMap={bodyRoughnessMap}
          bumpScale={1.5}
        />
      </mesh>
      <EasyNodeToMesh node={Rocket_window}>{windowMaterial}</EasyNodeToMesh>
      <EasyNodeToMesh node={Rocket_screws}>
        {windowFrameMaterial}
      </EasyNodeToMesh>
      <EasyNodeToMesh node={Rocket_window_frame}>
        {windowFrameMaterial}
      </EasyNodeToMesh>
      <EasyNodeToMesh node={Rocket_frame_hatch}>
        <meshPhysicalMaterial color="#aaa" metalness={1} roughness={0.2} />
      </EasyNodeToMesh>
      <EasyNodeToMesh node={Rocket_window_hatch}>
        {windowMaterial}
      </EasyNodeToMesh>
      <EasyNodeToMesh node={Engine}>
        <meshPhysicalMaterial color="#7a7a7a" metalness={1} roughness={0.45} />
      </EasyNodeToMesh>
      <mesh
        geometry={Rocket_fin.geometry}
        position={Rocket_fin.position}
        scale={Rocket_fin.scale}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#d02035"
          aoMap={finAO}
          aoMapIntensity={1}
          metalness={1}
          roughnessMap={finRoughnessMap}
          bumpMap={finRoughnessMap}
          bumpScale={1}
          roughness={1}
          clearcoat={1}
          clearcoatRoughness={0.03}
        />
      </mesh>
    </group>
  );
});

RocketModel.displayName = "RocketModel";
