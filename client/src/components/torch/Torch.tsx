import { focusAtom } from "jotai-optics";
import {
  cAtomInGroup,
  cAtomPosition,
  gAtomCurrentRoom,
} from "../../utils/atoms";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

export default function Torch({ id }: { id: string }) {
  const [positionAtom, inGroupAtom] = useMemo(
    () => [
      focusAtom(cAtomPosition, optic => optic.prop(id)),
      focusAtom(cAtomInGroup, optic => optic.prop(id)),
    ],
    [id]
  );
  const currentRoom = useAtomValue(gAtomCurrentRoom);
  const position = useAtomValue(positionAtom);
  // const [sleep, _setSleep] = useAtom(sleepAtom);
  const inGroup = useAtomValue(inGroupAtom);
  const sleep = currentRoom != inGroup;
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.1, 4, 4]} />
        <meshStandardMaterial
          color="orange"
          emissive="orange"
          emissiveIntensity={sleep ? 0 : 2}
        />
      </mesh>
      {!sleep && (
        <pointLight
          castShadow
          intensity={2}
          position={[0, 0.5, 0]}
          color={"#FCE5CE"}
          shadow-mapSize={512}
          shadow-camera-near={0.1}
        />
      )}
    </group>
  );
}
