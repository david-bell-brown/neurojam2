import { useAtom, useAtomValue } from "jotai";
import { focusAtom } from "jotai-optics";
import { useEffect, useMemo } from "react";
import {
  cAtomPosition,
  cAtomSpawnerMachine,
  cAtomCallbacks,
} from "../../utils/atoms";

export default function SpawnerTile({ id }: { id: string }) {
  const [positionAtom, machineAtomAtom, callbackAtom] = useMemo(
    () => [
      focusAtom(cAtomPosition, optic => optic.prop(id)),
      focusAtom(cAtomSpawnerMachine, optic => optic.prop(id)),
      focusAtom(cAtomCallbacks, optic => optic.prop(id)),
    ],
    [id]
  );

  const [position, _setPosition] = useAtom(positionAtom);
  const machineAtom = useAtomValue(machineAtomAtom);
  const [state, send] = useAtom(machineAtom);
  const [callback] = useAtomValue(callbackAtom);

  useEffect(() => {
    if (state.matches("spawning")) {
      callback(position);
      send({ type: "spawned" });
    }
  }, [state, callback, position, send]);

  const debug = process.env.NODE_ENV === "development";
  return (
    <group position={position}>
      {debug && (
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / -2, 0, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial color={"red"} />
        </mesh>
      )}
    </group>
  );
}
