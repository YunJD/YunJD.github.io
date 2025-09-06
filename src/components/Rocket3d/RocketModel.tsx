import { forwardRef, useRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

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

  const {
    Rocket_window_glass,
    Rocket_body,
    Rocket_window,
    Rocket_fin,
    Rocket_hatch_window,
  } = nodes as Record<string, THREE.Mesh>;

  return (
    <group ref={ref} {...props} rotation={[0, Math.PI * 0.5, 0]}>
      <mesh
        geometry={Rocket_window_glass.geometry}
        rotation={Rocket_window_glass.rotation}
        scale={Rocket_window_glass.scale}
        castShadow
      >
        <meshPhysicalMaterial
          color="#333"
          thickness={0.05}
          transmission={1}
          ior={1.5}
          reflectivity={0.5}
          transparent={true}
          opacity={1}
          roughness={0.0}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        ref={bodyRef}
        geometry={Rocket_body.geometry}
        position={Rocket_body.position}
        scale={Rocket_body.scale}
      >
        <meshPhysicalMaterial
          map={bodyMap}
          metalness={1}
          roughness={0.35}
          clearcoat={1}
        />
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
          roughness={0.8}
          clearcoat={0.1}
          clearcoatRoughness={0.05}
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
