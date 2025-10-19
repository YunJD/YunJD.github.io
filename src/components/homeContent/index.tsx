import "/src/css/index.css";
import classNames from "classnames";
import type { HTMLAttributes } from "react";
import { useMemo, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { RocketScene } from "src/components/Rocket3d";
import * as THREE from "three";

const Container = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classNames("max-w-7xl mx-auto relative", className)}
    {...props}
  />
);
function Content() {
  // Initial size of the canvas isn't initially set correctly, so explicitly control the height of the canvas
  const [canvasHeight, setCanvasHeight] = useState<string>("700px");
  useEffect(() => {
    const callback = () => {
      setCanvasHeight(window.innerHeight < 800 ? "800px" : "100vh");
    };
    callback();
    window.addEventListener("resize", callback);
    return () => {
      window.removeEventListener("resize", callback);
    };
  }, []);
  const camera = useMemo(
    () => new THREE.PerspectiveCamera(40, 1.5, 0.1, 1000),
    []
  );
  return (
    <main className="bg-black relative min-h-svh">
      <div className="lg:absolute w-full lg:h-full z-50">
        <Container className="flex px-20 pt-10 justify-center text-center items-start text-slate-100 w-full lg:text-left lg:h-full lg:items-center lg:justify-start lg:pt-0">
          <div>
            <div className="text-6xl lg:text-8xl font-extrabold mb-3">
              Jin Ding
            </div>
            <div className="inline-block text-2xl bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-500 font-medium">
              Software developer
            </div>
          </div>
        </Container>
      </div>
      <Canvas
        camera={camera}
        shadows
        dpr={[1, 4]}
        style={{
          height: canvasHeight,
          display: "block",
        }}
      >
        <RocketScene />
      </Canvas>
    </main>
  );
}

export default Content;
