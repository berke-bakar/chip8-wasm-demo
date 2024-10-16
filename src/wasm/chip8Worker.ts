self.importScripts("./Chip8.js"); // Replace with actual file path

let chip8Instance: Chip8 | null = null;
let cpuFrequency = 600; // Default CPU frequency (in Hz)
let timerFrequency = 60; // Default Timer frequency (in Hz)
let cpuCycleDuration = 1000 / cpuFrequency; // Duration of one CPU cycle in milliseconds
let timerDuration = 1000 / timerFrequency; // Duration of one timer update in milliseconds
let lastCpuCycleTime = 0;
let lastTimerUpdateTime = 0;
let running = false;
const runChip8Cycle = (timestamp: number) => {
  if (!chip8Instance || !running) return;

  // We process multiple cycles as requestAnimationFrame is slower than the CHIP8 CPU we emulate
  const cpuCyclesToRun = Math.floor(
    (timestamp - lastCpuCycleTime) / cpuCycleDuration
  );
  const timerUpdatesToRun = Math.floor(
    (timestamp - lastTimerUpdateTime) / timerDuration
  );
  // Handle CPU cycles
  for (let i = 0; i < cpuCyclesToRun; i++) {
    chip8Instance.run(); // Run one CPU cycle
    lastCpuCycleTime += cpuCycleDuration;
  }
  // Handle timers update
  for (let i = 0; i < timerUpdatesToRun; i++) {
    chip8Instance.updateTimers(); // Update delay and sound timers
    lastTimerUpdateTime += timerDuration;
  }

  // If the screen needs to be redrawn, send the display buffer back to the UI
  if (chip8Instance.drawGfx) {
    const gfxBuffer = chip8Instance.getGfx();
    postMessage({
      type: "draw",
      gfx: gfxBuffer, // Send display buffer (gfx) to main thread
    });
    chip8Instance.drawGfx = false;
  }

  requestAnimationFrame(runChip8Cycle);
};

onmessage = (e) => {
  const { type, data } = e.data;

  switch (type) {
    // Init message from main thread
    case "init":
      Module.onRuntimeInitialized = function () {
        chip8Instance = new Module.Chip8();
        chip8Instance.initialize();
        postMessage({ type: "initialized" });
      };

      break;

    case "loadRom":
      // Load the ROM into the Chip-8 instance
      if (chip8Instance) {
        const vec = new Module.Uint8Vector();
        for (let i = 0; i < data.rom.length; i++) {
          vec.push_back(data.rom[i]);
        }
        chip8Instance.initialize(); // reinitialize the emulator for clean start
        chip8Instance.loadProgram(vec);
        vec.delete();
        console.log("ROM Loaded");
        running = true;
        lastCpuCycleTime = performance.now();
        lastTimerUpdateTime = performance.now();
        requestAnimationFrame(runChip8Cycle); // Start the emulator loop
      }
      break;

    case "input":
      // Handle input (key press/release)
      if (chip8Instance) {
        chip8Instance.setInputKey(data.key, data.isPressed);
      }
      break;

    case "setFrequencies":
      // Update CPU and timer frequencies
      cpuFrequency = data.cpuFrequency;
      timerFrequency = data.timerFrequency;
      cpuCycleDuration = 1000 / cpuFrequency;
      timerDuration = 1000 / timerFrequency;
      break;

    case "pause":
      // Pause the emulator
      running = false;
      break;

    case "resume":
      // Resume the emulator
      if (!running) {
        running = true;
        lastCpuCycleTime = performance.now();
        lastTimerUpdateTime = performance.now();
        requestAnimationFrame(runChip8Cycle);
      }
      break;

    case "stop":
      // Stop the emulator and reset the state
      running = false;
      if (chip8Instance) {
        chip8Instance.initialize(); // Reinitialize the instance
      }
      break;

    default:
      console.error(`Unknown message type: ${type}`);
  }
};
