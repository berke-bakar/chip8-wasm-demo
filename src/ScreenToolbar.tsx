import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { animated, useSpring } from "@react-spring/web";
type Props = {
  worker: Worker | null;
  isWorkerActive: boolean;
};

enum MenuButtons {
  CLOSED = "Closed",
  KEYMAP = "keymapButton",
  SETTINGS = "settingsButton",
  HELP = "helpButton",
}

enum PlaybackButtons {
  PLAY = "resume",
  PAUSE = "pause",
  STOP = "stop",
}

export default function ScreenToolbar({ worker, isWorkerActive }: Props) {
  const currentRomRef = useRef<HTMLLIElement>(null);
  const currentRomName = useRef("");
  const currentRomInputRef = useRef<HTMLInputElement>(null);
  const currentCpuSpeedRef = useRef<HTMLSpanElement>(null);
  const currentTimerSpeedRef = useRef<HTMLSpanElement>(null);
  const cpuSpeedRangeRef = useRef<HTMLInputElement>(null);
  const timerSpeedRangeRef = useRef<HTMLInputElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const keymapMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState<MenuButtons>(MenuButtons.CLOSED);

  const handleOnRomLoad = useCallback(
    (event: ProgressEvent<FileReader>) => {
      const romData = new Uint8Array(event.target?.result as ArrayBuffer);

      // Set toolbar text
      if (currentRomRef.current)
        currentRomRef.current.textContent = `Loaded ROM: ${currentRomName.current}`;

      // Send the ROM data to the worker
      if (worker !== null)
        worker.postMessage({
          type: "loadRom",
          data: { rom: romData },
        });
    },
    [worker]
  );

  const fileReader = useMemo(() => {
    const fr = new FileReader();
    fr.onload = handleOnRomLoad;

    return fr;
  }, [handleOnRomLoad]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !worker) return;
      currentRomName.current = file.name;
      if (currentRomRef.current) {
        currentRomRef.current.textContent = `Loading ${currentRomName.current}...`;
      }
      fileReader.readAsArrayBuffer(file);
    },
    [fileReader, worker]
  );

  const handleButtonClick = useCallback(
    (e: MouseEvent) => {
      worker?.postMessage({
        type: showMenu !== MenuButtons.CLOSED ? "resume" : "pause",
      });
      const selected = (e.target as HTMLLIElement).id as MenuButtons;
      setShowMenu(showMenu == selected ? MenuButtons.CLOSED : selected);
    },
    [worker, setShowMenu, showMenu]
  );

  const handleResetClick = useCallback(() => {
    worker?.postMessage({ type: "reset" });
    setShowMenu(MenuButtons.CLOSED);
  }, [worker, setShowMenu]);

  const handlePlayback = useCallback(
    (e: MouseEvent) => {
      const selected = (e.target as HTMLLIElement).id;
      worker?.postMessage({ type: selected });
      if (
        selected === PlaybackButtons.STOP &&
        currentRomRef.current &&
        currentRomInputRef.current
      ) {
        currentRomName.current = "";
        currentRomRef.current.textContent = `Loaded Rom: `;
        currentRomInputRef.current.value = "";
      }
    },
    [worker]
  );

  const settingsMenuAnimation = useSpring({
    opacity: showMenu === MenuButtons.SETTINGS ? 1 : 0,
    transform:
      showMenu === MenuButtons.SETTINGS ? "translateY(0%)" : "translateY(-20%)",
    config: { tension: 220, friction: 20 },
    onStart: () => {
      if (showMenu === MenuButtons.SETTINGS) {
        settingsMenuRef.current?.classList.remove("hidden");
        keymapMenuRef.current?.classList.add("hidden");
        helpMenuRef.current?.classList.add("hidden");
      }
    },
    onRest: () => {
      settingsMenuRef.current?.classList.toggle(
        "hidden",
        showMenu != MenuButtons.SETTINGS
      );
    },
  });

  const keymapMenuAnimation = useSpring({
    opacity: showMenu === MenuButtons.KEYMAP ? 1 : 0,
    transform:
      showMenu === MenuButtons.KEYMAP ? "translateY(0%)" : "translateY(-20%)",
    config: { tension: 220, friction: 20 },
    onStart: () => {
      if (showMenu === MenuButtons.KEYMAP) {
        keymapMenuRef.current?.classList.remove("hidden");
        settingsMenuRef.current?.classList.add("hidden");
        helpMenuRef.current?.classList.add("hidden");
      }
    },
    onRest: () => {
      keymapMenuRef.current?.classList.toggle(
        "hidden",
        showMenu != MenuButtons.KEYMAP
      );
    },
  });

  const helpMenuAnimation = useSpring({
    opacity: showMenu === MenuButtons.HELP ? 1 : 0,
    transform:
      showMenu === MenuButtons.HELP ? "translateY(0%)" : "translateY(-20%)",
    config: { tension: 220, friction: 20 },
    onStart: () => {
      if (showMenu === MenuButtons.HELP) {
        helpMenuRef.current?.classList.remove("hidden");
        keymapMenuRef.current?.classList.add("hidden");
        settingsMenuRef.current?.classList.add("hidden");
      }
    },
    onRest: () => {
      helpMenuRef.current?.classList.toggle(
        "hidden",
        showMenu != MenuButtons.HELP
      );
    },
  });

  const handleDragEnd = useCallback(
    (e: MouseEvent) => {
      if (currentCpuSpeedRef.current && cpuSpeedRangeRef.current) {
        if ((e.target as HTMLInputElement).id === cpuSpeedRangeRef.current.id) {
          currentCpuSpeedRef.current.textContent = `${
            (e.target as HTMLInputElement).value
          } Hz`;
        }
      }
      if (currentTimerSpeedRef.current && timerSpeedRangeRef.current) {
        if (
          (e.target as HTMLInputElement).id === timerSpeedRangeRef.current.id
        ) {
          currentTimerSpeedRef.current.textContent = `${
            (e.target as HTMLInputElement).value
          } Hz`;
        }
      }

      if (timerSpeedRangeRef.current && cpuSpeedRangeRef.current && worker) {
        worker!.postMessage({
          type: "setFrequencies",
          data: {
            timerFrequency: timerSpeedRangeRef.current?.value,
            cpuFrequency: cpuSpeedRangeRef.current?.value,
          },
        });
      }
    },
    [worker]
  );

  useEffect(() => {
    if (isWorkerActive && currentRomRef.current && currentRomName.current == "")
      currentRomRef.current.textContent = "Emulator initialized successfully!";
  }, [isWorkerActive]);

  return (
    <>
      <ul className="flex bg-white w-full h-[20px] items-center select-none font-jersey py-2">
        <li className="border-black border px-2 cursor-pointer hover:bg-[rgba(0,0,0,0.3)]">
          <label htmlFor="upload" className="cursor-pointer">
            <span aria-hidden="true">Load ROM</span>
            <input
              type="file"
              id={"upload"}
              onChange={handleFileChange}
              className="hidden"
              ref={currentRomInputRef}
            />
          </label>
        </li>
        <li className="grow border-black border px-2" ref={currentRomRef}>
          Initializing CHIP-8 Emulator...
        </li>
        <li className="border-black border" id="playbackButtons">
          <ul className="flex tracking-[-0.2em] ">
            <li
              className="px-2 grow cursor-pointer hover:bg-[rgba(0,0,0,0.3)]"
              onClick={handlePlayback}
              id={PlaybackButtons.PLAY}
            >
              ▶
            </li>
            <li
              className="px-1 grow cursor-pointer hover:bg-[rgba(0,0,0,0.3)] pt-1"
              onClick={handlePlayback}
              id={PlaybackButtons.PAUSE}
            >
              <p className="text-xs pointer-events-none">▌▐</p>
            </li>
            <li
              className="px-2 grow cursor-pointer hover:bg-[rgba(0,0,0,0.3)]"
              onClick={handlePlayback}
              id={PlaybackButtons.STOP}
            >
              ◼
            </li>
          </ul>
        </li>
        <li
          className="border-black border px-2 cursor-pointer hover:bg-[rgba(0,0,0,0.3)]"
          id="helpButton"
          onClick={handleButtonClick}
        >
          ?
        </li>
        <li
          className="border-black border px-2 cursor-pointer hover:bg-[rgba(0,0,0,0.3)]"
          id="keymapButton"
          onClick={handleButtonClick}
        >
          ⌨
        </li>
        <li
          className={
            "border-black border px-2 cursor-pointer hover:bg-[rgba(0,0,0,0.3)]"
          }
          id="settingsButton"
          onClick={handleButtonClick}
        >
          ⚙
        </li>
      </ul>
      <animated.div
        style={keymapMenuAnimation}
        ref={keymapMenuRef}
        className="absolute top-[30px] right-[30px] bg-white border border-black p-2 w-[300px] select-none font-jersey hidden"
      >
        <div className="flex gap-4">
          <div className="text-center flex flex-col items-stretch grow w-1/2">
            <p>Original CHIP-8</p>
            <table>
              <thead>
                <tr>
                  <th scope="col"></th>
                  <th scope="col"></th>
                  <th scope="col"></th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black">1</td>
                  <td className="border border-black">2</td>
                  <td className="border border-black">3</td>
                  <td className="border border-black">C</td>
                </tr>
                <tr>
                  <td className="border border-black">4</td>
                  <td className="border border-black">5</td>
                  <td className="border border-black">6</td>
                  <td className="border border-black">D</td>
                </tr>
                <tr>
                  <td className="border border-black">7</td>
                  <td className="border border-black">8</td>
                  <td className="border border-black">9</td>
                  <td className="border border-black">E</td>
                </tr>
                <tr>
                  <td className="border border-black">A</td>
                  <td className="border border-black">0</td>
                  <td className="border border-black">B</td>
                  <td className="border border-black">F</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-center flex flex-col items-stretch grow w-1/2">
            <p>Emulator</p>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-black">1</td>
                  <td className="border border-black">2</td>
                  <td className="border border-black">3</td>
                  <td className="border border-black">4</td>
                </tr>
                <tr>
                  <td className="border border-black">Q</td>
                  <td className="border border-black">W</td>
                  <td className="border border-black">E</td>
                  <td className="border border-black">R</td>
                </tr>
                <tr>
                  <td className="border border-black">A</td>
                  <td className="border border-black">S</td>
                  <td className="border border-black">D</td>
                  <td className="border border-black">F</td>
                </tr>
                <tr>
                  <td className="border border-black">Z</td>
                  <td className="border border-black">X</td>
                  <td className="border border-black">C</td>
                  <td className="border border-black">V</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </animated.div>
      <animated.div
        style={settingsMenuAnimation}
        ref={settingsMenuRef}
        className={
          "absolute top-[30px] right-0 bg-white border border-black p-0 w-[250px] select-none font-jersey hidden"
        }
      >
        <ul>
          <li className="px-2">
            <label htmlFor="cpuFrequencyRange">
              <span aria-hidden="true">Change CPU Speed (Hz)</span>
              <div className="flex gap-4">
                <input
                  type="range"
                  id="cpuFrequencyRange"
                  max={1200}
                  min={400}
                  step={1}
                  onMouseUp={handleDragEnd}
                  ref={cpuSpeedRangeRef}
                />
                <span ref={currentCpuSpeedRef}>500 Hz</span>
              </div>
            </label>
          </li>
          <li className="px-2">
            <label htmlFor="timerFrequencyRange">
              <span aria-hidden="true">Change Timers Frequency (Hz)</span>
              <div className="flex gap-4">
                <input
                  type="range"
                  id="timerFrequencyRange"
                  max={120}
                  min={30}
                  step={1}
                  onMouseUp={handleDragEnd}
                  ref={timerSpeedRangeRef}
                />
                <span ref={currentTimerSpeedRef}>60 Hz</span>
              </div>
            </label>
          </li>
          <li
            onClick={handleResetClick}
            className="hover:bg-[rgba(0,0,0,0.3)] cursor-pointer px-2"
          >
            Reset ROM
          </li>
        </ul>
      </animated.div>
      <animated.div
        style={helpMenuAnimation}
        ref={helpMenuRef}
        className={
          "absolute top-[30px] left-0 right-0 mx-auto bg-white border border-black p-2 w-[250px] select-none font-jersey hidden"
        }
      >
        Welcome to my CHIP-8 Emulator. In order to test the machine, you need to
        have ROMs that can be read and interpretted by CHIP-8 system. Luckily,
        there are thousands created since late 1970s. You can find a collection
        of games and demo ROMs from the internet.{" "}
        <a
          href="https://github.com/kripod/chip8-roms/tree/master"
          className="text-blue-600"
        >
          Here
        </a>{" "}
        is an example collection on GitHub.
      </animated.div>
    </>
  );
}
