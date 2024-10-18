import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { useEffect } from "react";

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

  useEffect(() => {
    // materials.phong1.toneMapped = true;
    // materials.phong1.emissiveIntensity = 0;
  }, [materials]);

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.officeChair001.geometry}
        material={materials.phong1}
        position={[0.91434, 1.57865, 3]}
        rotation={[0, -0.71787, 0]}
      />
    </group>
  );
}

useGLTF.preload("/officeChair.glb");
