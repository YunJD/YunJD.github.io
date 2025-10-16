import { forwardRef, useRef, type ReactElement } from "react";
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
    Rocket_window_frame_screws,
  } = recordNodes;
  const windowMaterial = (
    <meshPhysicalMaterial color="#555" metalness={1} roughness={0} ior={1.4} />
  );
  const windowFrameMaterial = (
    <meshPhysicalMaterial color="#999" metalness={1} roughness={0.2} />
  );

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
          color="#ccc"
          metalness={1}
          roughness={0.65}
          roughnessMap={bodyRoughnessMap}
          bumpMap={bodyRoughnessMap}
          bumpScale={1.25}
        />
      </mesh>
      <EasyNodeToMesh node={Rocket_window}>{windowMaterial}</EasyNodeToMesh>
      <EasyNodeToMesh node={Rocket_window_frame_screws}>
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
      <mesh
        geometry={Engine.geometry}
        position={Engine.position}
        scale={Engine.scale}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial color="#777" metalness={1} roughness={0.4} />
      </mesh>
      <mesh
        geometry={Rocket_fin.geometry}
        position={Rocket_fin.position}
        scale={Rocket_fin.scale}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#700000"
          metalness={0}
          specularColor="#ffaadd"
          clearcoat={1}
          clearcoatRoughness={0.2}
        />
      </mesh>
    </group>
  );
});

RocketModel.displayName = "RocketModel";
