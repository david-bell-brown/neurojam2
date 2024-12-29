import { nanoid } from "nanoid";
import { Vector3 } from "@react-three/fiber";
import { useAtom } from "jotai";
import { cAtomHealth, cAtomPosition, cAtomType } from "../../utils/atoms";
import { useCallback } from "react";

export function usePlayerEntity() {
  const [_type, setType] = useAtom(cAtomType);
  const [_position, setPosition] = useAtom(cAtomPosition);
  const [_health, setHealth] = useAtom(cAtomHealth);

  const createEntity = useCallback(
    (pos: Vector3, health: number) => {
      const id = nanoid();
      setType(prev => ({ ...prev, [id]: "player" }));
      setPosition(prev => ({ ...prev, [id]: pos }));
      setHealth(prev => ({ ...prev, [id]: health }));
      return id;
    },
    [setHealth, setPosition, setType]
  );

  const destroyEntity = useCallback(
    (id: string) => {
      setType(prev => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      setPosition(prev => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      setHealth(prev => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    },
    [setHealth, setPosition, setType]
  );

  return { createEntity, destroyEntity };
}
