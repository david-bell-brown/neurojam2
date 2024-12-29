// Probably to be refactored as generic Sprite component

import { Billboard } from "@react-three/drei";
import { DoubleSide, NearestFilter, TextureLoader } from "three";
import { Direction } from "../../utils/atoms";
import tutel from "../../assets/tutel.png";
import { useLoader } from "@react-three/fiber";

type Props = {
  direction: Direction;
};

const offsetMap = {
  [Direction.DOWN]: 0,
  [Direction.LEFT]: 0.25,
  [Direction.UP]: 0.5,
  [Direction.RIGHT]: 0.75,
};

function BillboardSprite({ direction }: Props) {
  const texture = useLoader(TextureLoader, tutel);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.repeat.set(0.25, 1);
  texture.offset.x = offsetMap[direction];
  return (
    <group>
      <mesh castShadow position={[0, 0.5, 0]}>
        <planeGeometry args={[1, 1]} />
        <shadowMaterial side={DoubleSide} />
      </mesh>
      <Billboard>
        <mesh position={[0, 0.5, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshLambertMaterial
            attach="material"
            map={texture}
            side={DoubleSide}
            transparent
          />
        </mesh>
      </Billboard>
    </group>
  );
}

export default BillboardSprite;
