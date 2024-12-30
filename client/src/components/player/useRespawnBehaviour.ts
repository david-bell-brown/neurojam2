import { useEffect, useMemo } from "react";
import { PlayerMachineAtom } from "./entitySchema";
import { PrimitiveAtom, useAtom, useAtomValue } from "jotai";
import { cAtomPosition } from "../../utils/atoms";
import { focusAtom } from "jotai-optics";
import { RapierRigidBody } from "@react-three/rapier";

export default function useRespawnBehaviour(
  machineAtom: PlayerMachineAtom,
  nearestSpawnerIdAtom: PrimitiveAtom<string>,
  bodyRef: React.MutableRefObject<RapierRigidBody>
) {
  const [state, send] = useAtom(machineAtom);
  const [nearestSpawnerId] = useAtom(nearestSpawnerIdAtom);

  const [nearestSpawnerPositionAtom] = useMemo(
    () => [focusAtom(cAtomPosition, optic => optic.prop(nearestSpawnerId))],
    [nearestSpawnerId]
  );

  const nearestSpawnerPosition = useAtomValue(nearestSpawnerPositionAtom);

  // useEffect(() => {
  //   console.log("nearestSpawnerId: ", nearestSpawnerId);
  // }, [nearestSpawnerId]);

  useEffect(() => {
    if (!state.matches("respawn")) {
      return;
    }
    if (!nearestSpawnerPosition || !bodyRef.current) {
      console.error(
        `Can't respawn. Nearest Spawn: ${nearestSpawnerPosition}, Body: ${bodyRef.current}`
      );
      return;
    }
    const position = {
      x: nearestSpawnerPosition[0],
      y: nearestSpawnerPosition[1],
      z: nearestSpawnerPosition[2],
    };
    bodyRef.current.setTranslation(position, true);
    send({ type: "respawned" });
  }, [state, send, nearestSpawnerPosition, bodyRef, nearestSpawnerId]);
  return;
}
