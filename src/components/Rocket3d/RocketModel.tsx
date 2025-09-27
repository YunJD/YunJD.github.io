import { forwardRef, useRef, useMemo, type ReactElement } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const Engine = ({
  nodes,
  children,
  part,
}: {
  nodes: Record<string, THREE.Mesh>;
  part?: "_a" | "_b" | "_c" | "_d";
  children: ReactElement;
}) => {
  const suffix = part ?? "";
  const engine = nodes[`Rocket_engine${suffix}`];
  if (!engine) {
    return null;
  }
  return (
    <mesh
      castShadow
      receiveShadow
      geometry={engine.geometry}
      position={engine.position}
      scale={engine.scale}
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
  const windowRef = useRef(null);
  const rocket = useGLTF("/scenes3d/rocket/rocket.glb");
  const { nodes } = rocket;

  const recordNodes = nodes as Record<string, THREE.Mesh>;
  const { Rocket_body, Rocket_window, Rocket_fin, Rocket_hatch_window } =
    recordNodes;

  const engineMaterial = (
    <meshPhysicalMaterial color="#555" metalness={1} roughness={0.4} />
  );
  return (
    <group ref={ref} {...props} rotation={[0, Math.PI * 0.5, 0]}>
      <Engine nodes={recordNodes}>{engineMaterial}</Engine>
      <Engine nodes={recordNodes} part="_a">
        {engineMaterial}
      </Engine>
      <Engine nodes={recordNodes} part="_b">
        {engineMaterial}
      </Engine>
      <Engine nodes={recordNodes} part="_c">
        {engineMaterial}
      </Engine>
      <Engine nodes={recordNodes} part="_d">
        {engineMaterial}
      </Engine>
      <mesh
        receiveShadow
        ref={bodyRef}
        geometry={Rocket_body.geometry}
        position={Rocket_body.position}
        scale={Rocket_body.scale}
      >
        <meshPhysicalMaterial map={bodyMap} metalness={1} roughness={0.6} />
      </mesh>
      <mesh
        ref={windowRef}
        geometry={Rocket_window.geometry}
        position={Rocket_window.position}
        rotation={Rocket_window.rotation}
        scale={Rocket_window.scale}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial map={windowMap} metalness={1} roughness={0.2} />
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
          color="#ff0109"
          metalness={1}
          roughness={0.5}
          clearcoat={1}
        />
      </mesh>
      <mesh
        geometry={Rocket_hatch_window.geometry}
        rotation={Rocket_hatch_window.rotation}
        scale={Rocket_hatch_window.scale}
        castShadow
      >
        <meshPhysicalMaterial map={windowMap} metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
});

RocketModel.displayName = "RocketModel";
