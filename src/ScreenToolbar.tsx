import React, {
  MouseEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { animated, useSpring } from "@react-spring/web";
type Props = {
  worker: Worker | null;
};

export default function ScreenToolbar({ worker }: Props) {
  const currentRomRef = useRef<HTMLLIElement>(null);
  const currentRomName = useRef("");
  const currentCpuSpeedRef = useRef<HTMLSpanElement>(null);
  const currentTimerSpeedRef = useRef<HTMLSpanElement>(null);
  const cpuSpeedRangeRef = useRef<HTMLInputElement>(null);
  const timerSpeedRangeRef = useRef<HTMLInputElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const keymapMenuRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(0);

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
      fileReader.readAsArrayBuffer(file);
    },
    [fileReader, worker]
  );

  const handleButtonClick = useCallback(
    (e: MouseEvent) => {
      worker?.postMessage({ type: showMenu ? "resume" : "pause" });
      if (e.target.id === "keymapButton") {
        setShowMenu(showMenu == 1 ? 0 : 1); // Toggle keymap menu
      } else if (e.target.id === "settingsButton") {
        setShowMenu(showMenu == 2 ? 0 : 2); // Toggle settings menu
      }
    },
    [worker, setShowMenu, showMenu]
  );

  const handleResetClick = useCallback(() => {
    worker?.postMessage({ type: "reset" });
    setShowMenu(0);
  }, [worker, setShowMenu]);

  const settingsMenuAnimation = useSpring({
    opacity: showMenu === 2 ? 1 : 0,
    transform: showMenu === 2 ? "translateY(0%)" : "translateY(-20%)",
    config: { tension: 220, friction: 20 },
    onStart: () => {
      if (showMenu === 2) {
        settingsMenuRef.current?.classList.remove("hidden");
        keymapMenuRef.current?.classList.add("hidden");
      }
    },
    onRest: () => {
      settingsMenuRef.current?.classList.toggle(
        "hidden",
        showMenu === 0 || showMenu == 1
      );
    },
  });

  const keymapMenuAnimation = useSpring({
    opacity: showMenu === 1 ? 1 : 0,
    transform: showMenu === 1 ? "translateY(0%)" : "translateY(-20%)",
    config: { tension: 220, friction: 20 },
    onStart: () => {
      if (showMenu === 1) {
        keymapMenuRef.current?.classList.remove("hidden");
        settingsMenuRef.current?.classList.add("hidden");
      }
    },
    onRest: () => {
      keymapMenuRef.current?.classList.toggle(
        "hidden",
        showMenu === 0 || showMenu == 2
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

  return (
    <>
      <ul className="flex bg-white w-full h-[20px] items-center select-none font-jersey">
        <li className="border-black border px-2 py-1 cursor-pointer hover:bg-[rgba(0,0,0,0.3)]">
          <label htmlFor="upload" className="cursor-pointer">
            <span aria-hidden="true">Load ROM</span>
            <input
              type="file"
              id={"upload"}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </li>
        <li className="grow border-black border px-2 py-1" ref={currentRomRef}>
          Current ROM:
        </li>
        <li
          className="border-black border px-2 py-1 cursor-pointer hover:bg-[rgba(0,0,0,0.3)]"
          id="keymapButton"
          onClick={handleButtonClick}
        >
          ⌨
        </li>
        <li
          className={
            "border-black border px-2 py-1 cursor-pointer hover:bg-[rgba(0,0,0,0.3)]"
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
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </thead>
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
            </table>
          </div>
          <div className="text-center flex flex-col items-stretch grow w-1/2">
            <p>Emulator</p>
            <table>
              <thead>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </thead>
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
    </>
  );
}
