/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, Suspense } from "react";
import Chip8Canvas from "./Chip8Canvas";
import { Canvas } from "@react-three/fiber";
import { ComputerTable } from "./model/ComputerTable";
import { Html } from "@react-three/drei";
import { useControls } from "leva";
import ScreenToolbar from "./ScreenToolbar";
import CameraController from "./controller/CameraController";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import LoadingProgress from "./controller/LoadingProgress";

function App() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isWorkerActive, setIsWorkerActive] = useState(false);

  const handleOnMessage = useCallback(
    (e: MessageEvent) => {
      if (e.data.type === "initialized") {
        setIsWorkerActive(true);
      }
    },
    [setIsWorkerActive]
  );

  useEffect(() => {
    const newWorker = new Worker(
      new URL("./wasm/chip8Worker.ts", import.meta.url)
    );
    newWorker.addEventListener("message", handleOnMessage);
    setWorker(newWorker);

    // Handle cleanup
    return () => {
      newWorker.removeEventListener("message", handleOnMessage);
      newWorker.terminate();
    };
  }, [handleOnMessage]);

  const mapKeyToChip8 = useCallback((key: string) => {
    switch (key) {
      // 1st Row
      case "1":
        return 0x1;
      case "2":
        return 0x2;

      case "3":
        return 0x3;
      case "4":
        return 0xc;
      // 2nd Row
      case "q":
      case "Q":
        return 0x4;
      case "w":
      case "W":
        return 0x5;
      case "e":
      case "E":
        return 0x6;
      case "r":
      case "R":
        return 0xd;
      // 3rd Row
      case "a":
      case "A":
        return 0x7;
      case "s":
      case "S":
        return 0x8;
      case "d":
      case "D":
        return 0x9;
      case "F":
      case "f":
        return 0xe;
      // 4th Row
      case "z":
      case "Z":
        return 0xa;
      case "x":
      case "X":
        return 0x0;
      case "c":
      case "C":
        return 0xb;
      case "v":
      case "V":
        return 0xf;
    }
  }, []);

  useEffect(() => {
    // if (worker != null) worker?.postMessage({ type: "init" });
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!worker) return;
      // Map the key to the corresponding Chip-8 input and send to worker
      const chip8Key = mapKeyToChip8(e.key);
      worker.postMessage({
        type: "input",
        data: { key: chip8Key, isPressed: true },
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!worker) return;
      const chip8Key = mapKeyToChip8(e.key);
      worker.postMessage({
        type: "input",
        data: { key: chip8Key, isPressed: false },
      });
    };

    // Attach event listeners to the window
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [mapKeyToChip8, worker]);

  const {
    htmlPosition,
    htmlScale,
    cameraPosition,
    cameraRotation,
    directionalLightColor,
    directionalLightIntensity,
    studyLampIntensity,
  } = useControls({
    htmlPosition: {
      value: [-0.143, 3.309, -0.181],
    },
    htmlScale: {
      value: [0.048, 0.06, 1],
      step: 0.005,
    },
    cameraPosition: {
      value: [0, 4, 15],
      step: 0.1,
    },
    cameraRotation: {
      value: [0, 0, 0],
      step: 0.1,
    },
    directionalLightColor: "#ffffff",
    directionalLightIntensity: 1,
    studyLampIntensity: {
      value: 4.5,
      step: 0.1,
    },
  });

  return (
    <>
      <Canvas
        camera={{
          position: cameraPosition,
          rotation: cameraRotation,
        }}
      >
        <ambientLight intensity={1} />
        <directionalLight
          intensity={directionalLightIntensity}
          color={directionalLightColor}
        />
        <Suspense fallback={<LoadingProgress />}>
          <ComputerTable />
          <Html
            transform
            scale={htmlScale}
            position={htmlPosition}
            wrapperClass="relative"
          >
            <ScreenToolbar worker={worker} isWorkerActive={isWorkerActive} />
            {worker && <Chip8Canvas worker={worker} />}
          </Html>
          <CameraController />
        </Suspense>
        <EffectComposer>
          <Bloom
            mipmapBlur
            luminanceThreshold={1}
            intensity={studyLampIntensity}
            radius={0.8}
          />
        </EffectComposer>
      </Canvas>
    </>
  );
}

export default App;
