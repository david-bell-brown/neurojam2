import { useAtom } from "jotai";
import { cAtomPosition, cAtomType } from "../../utils/atoms";
import { useCallback } from "react";
import { addComponent, removeComponent } from "../../lib/ecs";
import { RealRoom } from "@app/lib";
import { dreiVec } from "../../utils/vector";

export function useRoomEntity() {
  const [_type, setType] = useAtom(cAtomType);
  const [_position, setPosition] = useAtom(cAtomPosition);

  const createEntity = useCallback(
    (room: RealRoom) => {
      const pos = dreiVec({ x: room.x, z: room.z });
      addComponent(room.id, "room", setType);
      addComponent(room.id, pos, setPosition);
      return room.id;
    },
    [setPosition, setType]
  );

  const destroyEntity = useCallback(
    (id: string) => {
      removeComponent(id, setType);
      removeComponent(id, setPosition);
    },
    [setPosition, setType]
  );

  return { createEntity, destroyEntity };
}
