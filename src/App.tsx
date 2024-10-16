/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Chip8Canvas from "./Chip8Canvas";
import { Canvas } from "@react-three/fiber";
import { ComputerTable } from "./model/ComputerTable";
import { Html, OrbitControls } from "@react-three/drei";
import { useControls } from "leva";

function App() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentRomRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const newWorker = new Worker(
      new URL("./wasm/chip8Worker.ts", import.meta.url)
    );
    setWorker(newWorker);

    // Handle cleanup
    return () => {
      newWorker.terminate();
    };
  }, []);

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
    if (worker != null) worker?.postMessage({ type: "init" });
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
      console.log("Removing event listener");

      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [worker]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !worker) return;

    // Read the ROM file as an ArrayBuffer
    const reader = new FileReader();
    reader.onload = function (event) {
      const romData = new Uint8Array(event.target?.result as ArrayBuffer);
      if (currentRomRef.current) currentRomRef.current.textContent = file.name;
      // Send the ROM data to the worker
      worker.postMessage({
        type: "loadRom",
        data: { rom: romData },
      });
    };

    reader.readAsArrayBuffer(file);
  };

  const { htmlPosition, htmlScale } = useControls({
    htmlPosition: {
      // value: [0, 3.22, 0],
      value: [-0.143, 3.309, -0.181],
    },
    htmlScale: {
      // value: [0.05, 0.09, 1],
      value: [0.04, 0.06, 1],
      step: 0.005,
    },
  });

  return (
    <>
      <Canvas>
        <ambientLight intensity={1} />
        <directionalLight intensity={1} />
        <OrbitControls makeDefault />
        <Suspense>
          <ComputerTable />
          <Html transform scale={htmlScale} position={htmlPosition}>
            <ul className="flex bg-white w-full h-[20px] items-center select-none font-jersey">
              <li className="border-black border px-2 py-1 cursor-pointer">
                <label htmlFor="upload" className="cursor-pointer">
                  <span
                    // className="cursor-pointer"
                    aria-hidden="true"
                  >
                    Load ROM
                  </span>
                  <input
                    type="file"
                    id={"upload"}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </li>
              <li
                className="grow border-black border px-2 py-1"
                ref={currentRomRef}
              >
                Current ROM:
              </li>
              <li className="border-black border px-2 py-1 cursor-pointer">
                🎮
              </li>
              <li className="border-black border px-2 py-1 cursor-pointer">
                ⚙
              </li>
            </ul>
            {worker && <Chip8Canvas worker={worker} />}
          </Html>
        </Suspense>
      </Canvas>
    </>
  );
}

export default App;
