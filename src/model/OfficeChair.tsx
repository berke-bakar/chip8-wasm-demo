import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { damp3, dampQ } from "maath/easing";

type GLTFResult = GLTF & {
  nodes: {
    officeChair001: THREE.Mesh;
  };
  materials: {
    phong1: THREE.MeshStandardMaterial;
  };
};

export function OfficeChair(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF("/officeChair.glb") as GLTFResult;
  const groupRef = useRef<THREE.Group>();
  const meshRef = useRef<THREE.Mesh>();
  const isMoved = useRef(false);
  const isReachedTarget = useRef(false);
  const targetVec = useMemo(() => new THREE.Vector3(1.5, 0, 0), []);
  const targetQuaternion = useMemo(
    () => new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -0.71787, 0)),
    []
  );

  useFrame((state, delta) => {
    if (groupRef.current && meshRef.current && !isReachedTarget.current) {
      isMoved.current = damp3(groupRef.current.position, targetVec, 0.5, delta);
      isMoved.current =
        dampQ(meshRef.current.quaternion, targetQuaternion, 0.5, delta) ||
        isMoved.current;
      if (isMoved.current) {
        const dist = groupRef.current.position.distanceToSquared(targetVec);
        isReachedTarget.current = dist <= 0.01;
        if (!isReachedTarget.current) {
          groupRef.current.position.y = Math.abs(
            Math.sin(10 * state.clock.elapsedTime) * 0.015
          );
        }
      }
    }
  });

  return (
    <group {...props} dispose={null} ref={groupRef}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.officeChair001.geometry}
        material={materials.phong1}
        position={[0.91434, 1.57865, 3]}
        rotation={[0, 3 * -0.71787, 0]}
        ref={meshRef}
      />
    </group>
  );
}

useGLTF.preload("/officeChair.glb");
