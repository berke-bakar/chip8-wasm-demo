import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";
import { Vector3Like } from "three";

export type State = {
  position: [number, number, number];
  rotation: Vector3Like;
  duration: number;
  headBobbing: boolean;
};

export const CAMERA_STATES: Array<State> = [
  {
    position: [0, 3.9, 15],
    rotation: { x: 0, y: 0, z: 0 },
    duration: 0.4,
    headBobbing: false,
  },
  {
    position: [0, 3.9, 2],
    rotation: { x: -0.1, y: 0, z: 0 },
    duration: 1.5,
    headBobbing: true,
  },
  {
    position: [0, 3.4, 0.7],
    rotation: { x: -0.1, y: 0, z: 0 },
    duration: 0.35,
    headBobbing: false,
  },
];
export const cameraStateIndexAtom = atomWithReset(0);

export const currentCameraStateAtom = atom(
  (get) => {
    const index = get(cameraStateIndexAtom);
    return CAMERA_STATES[index];
  },
  (get, set, action) => {
    if (action === "advance") {
      const index = get(cameraStateIndexAtom);
      const newIndex = Math.min(index + 1, CAMERA_STATES.length - 1);
      set(cameraStateIndexAtom, newIndex);
    } else if (action === "retreat") {
      const index = get(cameraStateIndexAtom);
      const newIndex = Math.max(index - 1 + CAMERA_STATES.length, 0);
      set(cameraStateIndexAtom, newIndex);
    }
  }
);
