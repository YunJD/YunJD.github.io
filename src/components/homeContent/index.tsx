import "/src/css/index.css";
import classNames from "classnames";
import type { HTMLAttributes } from "react";
import { Canvas } from "@react-three/fiber";
import { RocketScene } from "/src/components/Rocket3d";

const Container = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classNames("max-w-7xl mx-auto relative", className)}
    {...props}
  />
);
const Section = (props: HTMLAttributes<HTMLDivElement>) => (
  <div className="p-8" {...props} />
);

function Content() {
  return (
    <main>
      <div className="bg-black relative">
        <div className="lg:absolute w-full h-full">
          <Container className="flex pt-10 justify-center text-center items-start text-slate-100  w-full lg:text-left lg:h-full lg:items-center lg:justify-start lg:pt-0">
            <Section>
              <div className="text-8xl font-extrabold">Jin Ding</div>
              <div className="mt-10 inline-block text-2xl bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-500 font-medium">
                Shipping software since 3142
              </div>
              <p className="mt-4 text-lg">Software developer. 3D enthusiast.</p>
            </Section>
          </Container>
        </div>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          className="lg:w-full lg:h-screen"
          style={{ width: undefined, height: undefined, minHeight: 800 }}
        >
          <RocketScene />
        </Canvas>
      </div>
    </main>
  );
}

export default Content;
