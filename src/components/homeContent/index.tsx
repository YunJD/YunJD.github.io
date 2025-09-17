import "/src/css/index.css";
import classNames from "classnames";
import type { HTMLAttributes } from "react";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { RocketScene } from "src/components/Rocket3d";

const Container = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classNames("max-w-7xl mx-auto relative", className)}
    {...props}
  />
);
const Section = (props: HTMLAttributes<HTMLDivElement>) => (
  <div className="px-8" {...props} />
);

function Content() {
  // Initial size of the canvas isn't initially set correctly, so explicitly control the height of the canvas
  const [canvasHeight, setCanvasHeight] = useState<string>("700px");
  useEffect(() => {
    const callback = () => {
      setCanvasHeight(window.innerHeight < 700 ? "700px" : "100vh");
    };
    callback();
    window.addEventListener("resize", callback);
    return () => {
      window.removeEventListener("resize", callback);
    };
  }, []);
  return (
    <main className="bg-black relative min-h-svh">
      <div className="lg:absolute w-full lg:h-full">
        <Container className="flex pt-10 justify-center text-center items-start text-slate-100 w-full lg:text-left lg:h-full lg:items-center lg:justify-start lg:pt-0">
          <Section>
            <div className="text-8xl font-extrabold">Jin Ding</div>
            <div className="mt-10 inline-block text-2xl bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-500 font-medium">
              Software developer. 3D enthusiast.
            </div>
          </Section>
        </Container>
      </div>
      <Canvas
        shadows
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
