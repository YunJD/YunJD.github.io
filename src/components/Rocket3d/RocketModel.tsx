import { forwardRef, useRef, useMemo, type ReactElement } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const Window = ({
  nodes,
  children,
  part = "_1",
}: {
  nodes: Record<string, THREE.Mesh>;
  part?: "_1" | "_2" | "_3" | "_hatch";
  children: ReactElement;
}) => {
  const suffix = part ?? "";
  const windowMesh = nodes[`Rocket_window${suffix}`];
  if (!windowMesh) {
    return null;
  }
  return (
    <mesh
      castShadow
      receiveShadow
      geometry={windowMesh.geometry}
      position={windowMesh.position}
      scale={windowMesh.scale}
      rotation={windowMesh.rotation}
    >
      {children}
    </mesh>
  );
};

export const RocketModel = forwardRef((props, ref) => {
  const bodyMap = useMemo(() => {
    const tex = new THREE.TextureLoader().load(
      "/scenes3d/rocket/Rocket Body.png"
    );
    tex.flipY = false;
    return tex;
  }, []);

  const windowMap = useMemo(() => {
    const tex = new THREE.TextureLoader().load(
      "/scenes3d/rocket/Rocket Window.png"
    );
    tex.flipY = false;
    return tex;
  }, []);

  const bodyRef = useRef(null);
  const finRef = useRef(null);
  const rocket = useGLTF("/scenes3d/rocket/rocket.glb");
  const { nodes } = rocket;

  const recordNodes = nodes as Record<string, THREE.Mesh>;
  const { Rocket_body, Rocket_fin } = recordNodes;

  const windowMaterial = (
    <meshPhysicalMaterial map={windowMap} metalness={1} roughness={0.2} />
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
      <Window part="_1" nodes={recordNodes}>
        {windowMaterial}
      </Window>
      <Window part="_2" nodes={recordNodes}>
        {windowMaterial}
      </Window>
      <Window part="_3" nodes={recordNodes}>
        {windowMaterial}
      </Window>
      <Window part="_hatch" nodes={recordNodes}>
        {windowMaterial}
      </Window>
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
