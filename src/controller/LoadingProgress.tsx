import { useSpring, animated } from "@react-spring/web";
import { Html, useProgress } from "@react-three/drei";

export default function LoadingProgress() {
  const { active, progress } = useProgress();
  const divSpringProps = useSpring({
    from: { scaleX: 0 },
    to: { scaleX: progress / 100 },
    config: { duration: 100 },
  });

  if (!active) return null;
  return (
    <Html
      center
      className="flex flex-col gap-10 items-center min-w-[70dvw]"
      position-y={4.1}
    >
      <p className="text-white font-jersey text-lg md:text-2xl lg:text-3xl animate-pulse text-center">
        Loading simulation for emulation...{progress.toFixed(2)}%
      </p>
      <div className="w-[50dvw] h-[40px] md:w-[30dvw] md:h-[80px] border-8 animate-pulse">
        <animated.div
          className="bg-white h-full w-full"
          style={{ ...divSpringProps, transformOrigin: "0% 50%" }}
        ></animated.div>
      </div>
    </Html>
  );
}
