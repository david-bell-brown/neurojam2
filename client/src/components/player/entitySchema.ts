import { nanoid } from "nanoid";
import { Vector3 } from "@react-three/fiber";
import { useAtom } from "jotai";
import {
  cAtomDirection,
  cAtomPlayerMachine,
  cAtomPosition,
  cAtomType,
  Direction,
  cAtomMoveSpeed,
  cAtomNearestSpawner,
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
        after: {
          3000: "respawn",
        },
      },
      respawn: {
        on: {
          respawned: {
            target: "idle",
          },
        },
      },
    },
  });

export type PlayerMachine = ReturnType<typeof createPlayerMachine>;
export type PlayerMachineAtom = ReturnType<
  typeof atomWithMachine<PlayerMachine>
>;

export function usePlayerEntity() {
  const [_type, setType] = useAtom(cAtomType);
  const [_position, setPosition] = useAtom(cAtomPosition);
  const [_direction, setDirection] = useAtom(cAtomDirection);
  const [_machine, setMachine] = useAtom(cAtomPlayerMachine);
  const [_moveSpeed, setMoveSpeed] = useAtom(cAtomMoveSpeed);
  const [_nearestSpawner, setNearestSpawner] = useAtom(cAtomNearestSpawner);

  const createEntity = useCallback(
    (pos: Vector3, nearestSpawner: string, existingId?: string | null) => {
      const id = existingId || nanoid();
      const machineAtom = atomWithMachine(createPlayerMachine(id));
      addComponent(id, "player", setType);
      addComponent(id, pos, setPosition);
      addComponent(id, Direction.DOWN, setDirection);
      addComponent(id, machineAtom, setMachine);
      addComponent(id, 2, setMoveSpeed);
      addComponent(id, nearestSpawner, setNearestSpawner);
      return id;
    },
    [
      setType,
      setPosition,
      setDirection,
      setMachine,
      setMoveSpeed,
      setNearestSpawner,
    ]
  );

  const updateEntity = useCallback(
    (
      id: string,
      data: {
        position?: Vector3;
        direction?: Direction;
        moveSpeed?: number;
        nearestSpawner?: string;
      }
    ) => {
      if (data.position) addComponent(id, data.position, setPosition);
      if (data.direction) addComponent(id, data.direction, setDirection);
      if (data.moveSpeed) addComponent(id, data.moveSpeed, setMoveSpeed);
      if (data.nearestSpawner)
        addComponent(id, data.nearestSpawner, setNearestSpawner);
    },
    [setPosition, setDirection, setMoveSpeed, setNearestSpawner]
  );

  const destroyEntity = useCallback(
    (id: string) => {
      removeComponent(id, setType);
      removeComponent(id, setPosition);
      removeComponent(id, setDirection);
      removeComponent(id, setMachine);
      removeComponent(id, setMoveSpeed);
      removeComponent(id, setNearestSpawner);
    },
    [
      setType,
      setPosition,
      setDirection,
      setMachine,
      setMoveSpeed,
      setNearestSpawner,
    ]
  );

  return { createEntity, destroyEntity, updateEntity };
}
