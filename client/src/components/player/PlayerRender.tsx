// Probably to be refactored as generic Sprite component

import { Billboard } from "@react-three/drei";
import { DoubleSide } from "three";

function PlayerRender() {
  return (
    <group>
      <mesh castShadow position={[0, 0.5, 0]}>
        <planeGeometry args={[1, 1]} />
        <shadowMaterial side={DoubleSide} />
      </mesh>
      <Billboard>
        <mesh position={[0, 0.5, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshLambertMaterial color={"#ff0000"} side={DoubleSide} />
        </mesh>
      </Billboard>
    </group>
  );
}

export default PlayerRender;
