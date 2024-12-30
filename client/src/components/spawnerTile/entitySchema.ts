import { useSetAtom } from "jotai";
import { atomWithMachine } from "jotai-xstate";
import { useCallback } from "react";
import { setup } from "xstate";
import { addComponent, removeComponent } from "../../lib/ecs";
import {
  cAtomType,
  cAtomPosition,
  cAtomSpawnerMachine,
  cAtomPositionCallbacks,
  cAtomInGroup,
} from "../../utils/atoms";
import { Vector3 } from "@react-three/fiber";
import { PointRoomFeature, RealRoomFeature } from "@app/lib";
import { dreiVec } from "../../utils/vector";

type SpawnerFeature = PointRoomFeature & {
  id: string;
  class: "spawn";
};

export function getSpawnerFeatures(
  features: RealRoomFeature[]
): SpawnerFeature[] {
  const spawnerFeatures = features.filter(
    (feature): feature is RealRoomFeature & { type: "point"; class: "spawn" } =>
      feature.type === "point" && feature.class === "spawn"
  ) as SpawnerFeature[];

  return spawnerFeatures;
}

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
  const setType = useSetAtom(cAtomType);
  const setPosition = useSetAtom(cAtomPosition);
  const setMachine = useSetAtom(cAtomSpawnerMachine);
  const setCallback = useSetAtom(cAtomPositionCallbacks);
  const setInGroup = useSetAtom(cAtomInGroup);

  const createEntity = useCallback(
    (
      feature: SpawnerFeature,
      groupId: string,
      callback: (spawnerId: string, pos: Vector3) => void,
      immediate = false
    ) => {
      const { id, x, z } = feature;
      const machineAtom = atomWithMachine(
        createSpawnMachine(id, immediate ? "spawning" : "idle")
      );
      addComponent(id, "spawner", setType);
      addComponent(id, dreiVec({ x, z }), setPosition);
      addComponent(id, machineAtom, setMachine);
      addComponent(id, [callback], setCallback);
      addComponent(id, groupId, setInGroup);
      return id;
    },
    [setType, setPosition, setMachine, setCallback, setInGroup]
  );

  const destroyEntity = useCallback(
    (id: string) => {
      removeComponent(id, setType);
      removeComponent(id, setPosition);
      removeComponent(id, setMachine);
      removeComponent(id, setCallback);
      removeComponent(id, setInGroup);
    },
    [setType, setPosition, setMachine, setCallback, setInGroup]
  );

  return { createEntity, destroyEntity };
}
