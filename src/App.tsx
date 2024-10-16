/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from "react";
import Chip8Canvas from "./Chip8Canvas";

function App() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // Send the ROM data to the worker
      worker.postMessage({
        type: "loadRom",
        data: { rom: romData },
      });
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="App">
      <h1>Chip8 Emulator</h1>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        // accept=".c8.ch8"
      />
      {worker && <Chip8Canvas worker={worker} />}
    </div>
  );
}

export default App;
