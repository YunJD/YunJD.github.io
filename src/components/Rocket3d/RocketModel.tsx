import { forwardRef, useRef, useMemo, type ReactElement } from "react";
import { useGLTF } from "@react-three/drei";
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
  const bodyMap = useMemo(() => {
    const tex = new THREE.TextureLoader().load(
      "/scenes3d/rocket/Rocket Body.png"
    );
    tex.flipY = false;
    return tex;
  }, []);

  const bodyRef = useRef(null);
  const finRef = useRef(null);
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
  } = recordNodes;
  const windowMaterial = (
    <meshPhysicalMaterial
      color="#020202"
      transparent
      metalness={1}
      clearcoat={1}
    />
  );
  const windowFrameMaterial = (
    <meshPhysicalMaterial color="#aaa" metalness={1} roughness={0.2} />
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
        <meshPhysicalMaterial map={bodyMap} metalness={1} roughness={0.3} />
      </mesh>
      <EasyNodeToMesh node={Rocket_window}>{windowMaterial}</EasyNodeToMesh>
      <EasyNodeToMesh node={Rocket_window_frame}>
        {windowFrameMaterial}
      </EasyNodeToMesh>
      <EasyNodeToMesh node={Rocket_frame_hatch}>
        {windowFrameMaterial}
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
        ref={finRef}
        geometry={Rocket_fin.geometry}
        position={Rocket_fin.position}
        scale={Rocket_fin.scale}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#dd0109"
          metalness={1}
          roughness={0.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </group>
  );
});

RocketModel.displayName = "RocketModel";
