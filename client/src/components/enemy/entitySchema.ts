import { nanoid } from "nanoid";
import { Vector3 } from "@react-three/fiber";
import { useAtom } from "jotai";
import { cAtomHealth, cAtomPosition, cAtomType } from "../../utils/atoms";
import { useCallback } from "react";
import { addComponent, removeComponent } from "../../lib/ecs";

export function useEnemyEntity() {
  const [_type, setType] = useAtom(cAtomType);
  const [_position, setPosition] = useAtom(cAtomPosition);
  const [_health, setHealth] = useAtom(cAtomHealth);

  const createEntity = useCallback(
    (pos: Vector3, health: number) => {
      const id = nanoid();
      addComponent(id, "enemy", setType);
      addComponent(id, pos, setPosition);
      addComponent(id, health, setHealth);
      return id;
    },
    [setHealth, setPosition, setType]
  );

  const destroyEntity = useCallback(
    (id: string) => {
      removeComponent(id, setType);
      removeComponent(id, setPosition);
      removeComponent(id, setHealth);
    },
    [setHealth, setPosition, setType]
  );

  return { createEntity, destroyEntity };
}
