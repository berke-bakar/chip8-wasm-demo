import React, { useEffect, useRef } from "react";

type Chip8CanvasProps = {
  worker: Worker;
};

const CHIP8_WIDTH = 64;
const CHIP8_HEIGHT = 32;
const SCALE = 10;

const Chip8Canvas: React.FC<Chip8CanvasProps> = ({ worker }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CHIP8_WIDTH * SCALE;
    canvas.height = CHIP8_HEIGHT * SCALE;

    // Update canvas according to emulator's gfx array
    const drawGfx = (gfx: Uint8Array) => {
      for (let y = 0; y < CHIP8_HEIGHT; y++) {
        for (let x = 0; x < CHIP8_WIDTH; x++) {
          const index = y * CHIP8_WIDTH + x;
          ctx.fillStyle = gfx[index] === 1 ? "#FFFFFF" : "#000000";
          ctx.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
        }
      }
    };

    const handleWorkerMessage = (e: MessageEvent) => {
      const { type, gfx } = e.data;
      if (type === "draw") {
        // Call the drawing function when gfx data is received
        drawGfx(gfx);
      }
    };

    worker.addEventListener("message", handleWorkerMessage);

    return () => {
      worker.removeEventListener("message", handleWorkerMessage);
    };
  }, [worker]);

  return <canvas ref={canvasRef} />;
};

export default Chip8Canvas;
