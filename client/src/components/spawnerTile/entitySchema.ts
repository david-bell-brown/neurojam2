import { useAtom } from "jotai";
import { atomWithMachine } from "jotai-xstate";
import { nanoid } from "nanoid";
import { useCallback } from "react";
import { setup } from "xstate";
import { addComponent, removeComponent } from "../../lib/ecs";
import {
  cAtomType,
  cAtomPosition,
  cAtomSpawnerMachine,
  cAtomCallbacks,
} from "../../utils/atoms";
import { Vector3 } from "@react-three/fiber";

const createSpawnMachine = (id: string, initialState: "idle" | "spawning") =>
  setup({}).createMachine({
    id,
    initial: initialState,
    states: {
      idle: {
        on: {
          spawn: {
            target: "spawning",
          },
        },
      },
      spawning: {
        on: {
          spawned: {
            target: "idle",
          },
        },
      },
    },
  });
export type SpawnMachine = ReturnType<typeof createSpawnMachine>;

export function useSpawnerEntity() {
  const [, setType] = useAtom(cAtomType);
  const [, setPosition] = useAtom(cAtomPosition);
  const [, setMachine] = useAtom(cAtomSpawnerMachine);
  const [, setCallback] = useAtom(cAtomCallbacks);

  const createEntity = useCallback(
    (pos: Vector3, callback: (pos: Vector3) => void, immediate = false) => {
      const id = nanoid();
      const machineAtom = atomWithMachine(
        createSpawnMachine(id, immediate ? "spawning" : "idle")
      );
      addComponent(id, "spawner", setType);
      addComponent(id, pos, setPosition);
      addComponent(id, machineAtom, setMachine);
      addComponent(id, [callback], setCallback);
      return id;
    },
    [setType, setPosition, setMachine, setCallback]
  );

  const destroyEntity = useCallback(
    (id: string) => {
      removeComponent(id, setType);
      removeComponent(id, setPosition);
      removeComponent(id, setMachine);
      removeComponent(id, setCallback);
    },
    [setType, setPosition, setMachine, setCallback]
  );

  return { createEntity, destroyEntity };
}
