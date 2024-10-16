import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    ComputerTable_1: THREE.Mesh;
    ComputerTable_2: THREE.Mesh;
    ComputerTable_3: THREE.Mesh;
  };
  materials: {
    TerminalMaterial: THREE.MeshStandardMaterial;
    table_mat: THREE.MeshStandardMaterial;
    floor_mat: THREE.MeshStandardMaterial;
  };
};

export function ComputerTable(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF("/ComputerTable.glb") as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <group
        position={[-0.2267, 1.85243, 0.15323]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={3.83049}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.ComputerTable_1.geometry}
          material={materials.TerminalMaterial}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.ComputerTable_2.geometry}
          material={materials.table_mat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.ComputerTable_3.geometry}
          material={materials.floor_mat}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/ComputerTable.glb");
