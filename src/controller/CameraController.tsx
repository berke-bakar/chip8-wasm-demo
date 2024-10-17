import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { damp3, dampQ } from "maath/easing";
import { useEffect, useMemo, useRef } from "react";
import { Euler, Quaternion, Vector3 } from "three";
import { CAMERA_STATES, currentCameraStateAtom } from "../contants";

const CameraController = () => {
  const [cameraState, updateCameraState] = useAtom(currentCameraStateAtom);
  const statePosVector = useMemo(() => new Vector3(), []);
  const stateRotEuler = useMemo(() => new Euler(), []);
  const stateRotQuat = useMemo(() => new Quaternion(), []);
  const isFinalState = useRef(false);

  useEffect(() => {
    statePosVector.fromArray(cameraState.position);

    // Apply rotations around global axes with quaternions
    stateRotEuler.setFromVector3(cameraState.rotation as Vector3, "YXZ");
    stateRotQuat.setFromEuler(stateRotEuler);
  }, [cameraState]);

  useFrame((state, delta) => {
    if (cameraState.duration == 0) {
      updateCameraState("advance");
    }
    const original = [...cameraState.position];
    const modified = [...cameraState.position];
    const actualDis = state.camera.position.distanceToSquared({
      x: original[0],
      y: original[1],
      z: original[2],
    });
    if (cameraState.headBobbing && actualDis >= 0.5) {
      modified[1] *= Math.abs(Math.sin(state.clock.elapsedTime * 4) * 1.5);
    }
    const movedPosition = damp3(state.camera.position, modified, 1, delta);
    const movedRotation = dampQ(
      state.camera.quaternion,
      stateRotQuat,
      cameraState.duration,
      delta
    );

    if (!movedPosition && !movedRotation && !isFinalState.current) {
      if (!isFinalState.current) {
        isFinalState.current =
          CAMERA_STATES[CAMERA_STATES.length - 1] == cameraState;
        updateCameraState("advance");
      }
    }
  });

  return null;
};

export default CameraController;
