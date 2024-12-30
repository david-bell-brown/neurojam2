import { Vector3 } from "@react-three/fiber";
import { useAtom } from "jotai";
import { cAtomScale, cAtomPosition, cAtomType } from "../../utils/atoms";
import { useCallback } from "react";
import { addComponent, removeComponent } from "../../lib/ecs";
import { RealRoom } from "@app/lib";

export function useRoomEntity() {
  const [_type, setType] = useAtom(cAtomType);
  const [_position, setPosition] = useAtom(cAtomPosition);
  const [_scale, setScale] = useAtom(cAtomScale);

  const createEntity = useCallback(
    (room: RealRoom) => {
      let scale: Vector3 = [room.width, 1, room.height];
      let pos: Vector3 = [room.x, 0, room.z];
      addComponent(room.id, "room", setType);
      addComponent(room.id, pos, setPosition);
      addComponent(room.id, scale, setScale);
      return room.id;
    },
    [setPosition, setType, setScale]
  );

  const destroyEntity = useCallback(
    (id: string) => {
      removeComponent(id, setType);
      removeComponent(id, setPosition);
      removeComponent(id, setScale);
    },
    [setPosition, setType, setScale]
  );

  return { createEntity, destroyEntity };
}
