import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF, KTX2Loader } from "three-stdlib";
import { useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";

type GLTFResult = GLTF & {
  nodes: {
    computerTable_1: THREE.Mesh;
    computerTable_2: THREE.Mesh;
    computerTable_3: THREE.Mesh;
    sm_lamp_emis019_1_Lamp_white001_0: THREE.Mesh;
    sm_lamp_emis019_1_Lamp_white001_0_1: THREE.Mesh;
    Bulb: THREE.Mesh;
  };
  materials: {
    floor_mat: THREE.MeshStandardMaterial;
    TerminalMaterial: THREE.MeshStandardMaterial;
    table_mat: THREE.MeshStandardMaterial;
    material_atlas_00001_1: THREE.MeshStandardMaterial;
    ["1._Lamp_meall"]: THREE.MeshStandardMaterial;
  };
};

const ktx2loader = new KTX2Loader();
ktx2loader.setTranscoderPath(
  "https://cdn.jsdelivr.net/gh/pmndrs/drei-assets/basis/"
);

export function ComputerTable(props: JSX.IntrinsicElements["group"]) {
  const { gl } = useThree();
  const { nodes, materials } = useGLTF(
    "/computerTable.glb",
    undefined,
    undefined,
    (loader) => {
      ktx2loader.detectSupport(gl);
      loader.setKTX2Loader(ktx2loader);
    }
  ) as GLTFResult;

  const lampMaterialRef = useRef<THREE.MeshBasicMaterial>();
  const firstColorEdit = useRef(true);

  useControls({
    studyLampColor: {
      r: 1.2,
      g: 1.2,
      b: 0.6,
      a: 1.0,
      onChange: (e) => {
        if (firstColorEdit.current) {
          firstColorEdit.current = false;
          return;
        }

        lampMaterialRef.current?.color.set(e.r, e.g, e.b);
      },
    },
  });

  return (
    <group {...props} dispose={null}>
      <group
        position={[-0.18962, -0.04593, 0.12278]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.computerTable_1.geometry}
          material={materials.floor_mat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.computerTable_2.geometry}
          material={materials.TerminalMaterial}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.computerTable_3.geometry}
          material={materials.table_mat}
        />
      </group>
      <group
        position={[-1.56198, 2.66152, -0.71874]}
        rotation={[-Math.PI / 2, 0, 2.14344]}
        scale={2.23654}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.sm_lamp_emis019_1_Lamp_white001_0.geometry}
          material={materials.material_atlas_00001_1}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.sm_lamp_emis019_1_Lamp_white001_0_1.geometry}
          material={materials["1._Lamp_meall"]}
        />
      </group>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Bulb.geometry}
        material={materials.material_atlas_00001_1}
        position={[-1.56198, 2.66152, -0.71874]}
        rotation={[-Math.PI / 2, 0, 2.14344]}
        scale={2.23654}
      >
        <meshBasicMaterial
          ref={lampMaterialRef}
          color={[1.2, 1.2, 0.6]}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload("", undefined, undefined, (loader) => {
  loader.setKTX2Loader(ktx2loader);
});
