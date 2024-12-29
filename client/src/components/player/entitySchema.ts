import { nanoid } from "nanoid";
import { Vector3 } from "@react-three/fiber";
import { useAtom } from "jotai";
import {
  cAtomDirection,
  cAtomMachine,
  cAtomPosition,
  cAtomType,
  Direction,
  cAtomMoveSpeed,
} from "../../utils/atoms";
import { useCallback } from "react";
import { addComponent, removeComponent } from "../../lib/ecs";
import { setup } from "xstate";
import { atomWithMachine } from "jotai-xstate";

const createPlayerMachine = (id: string) =>
  setup({}).createMachine({
    id,
    initial: "idle",
    states: {
      idle: {
        on: {
          walk: {
            target: "walking",
          },
          hurt: {
            target: "dead",
          },
        },
      },
      walking: {
        on: {
          stopMoving: {
            target: "idle",
          },
          hurt: {
            target: "dead",
          },
        },
      },
      dead: {
        on: {
          respawn: {
            target: "idle",
          },
        },
      },
    },
  });
export type PlayerMachine = ReturnType<typeof createPlayerMachine>;

export function usePlayerEntity() {
  const [_type, setType] = useAtom(cAtomType);
  const [_position, setPosition] = useAtom(cAtomPosition);
  const [_direction, setDirection] = useAtom(cAtomDirection);
  const [_machine, setMachine] = useAtom(cAtomMachine);
  const [_moveSpeed, setMoveSpeed] = useAtom(cAtomMoveSpeed);

  const createEntity = useCallback(
    (pos: Vector3) => {
      const id = nanoid();
      const machineAtom = atomWithMachine(createPlayerMachine(id));
      addComponent(id, "player", setType);
      addComponent(id, pos, setPosition);
      addComponent(id, Direction.DOWN, setDirection);
      addComponent(id, machineAtom, setMachine);
      addComponent(id, 2, setMoveSpeed);
      return id;
    },
    [setDirection, setPosition, setType, setMachine, setMoveSpeed]
  );

  const destroyEntity = useCallback(
    (id: string) => {
      removeComponent(id, setType);
      removeComponent(id, setPosition);
      removeComponent(id, setDirection);
      removeComponent(id, setMachine);
      removeComponent(id, setMoveSpeed);
    },
    [setDirection, setPosition, setType, setMachine, setMoveSpeed]
  );

  return { createEntity, destroyEntity };
}
