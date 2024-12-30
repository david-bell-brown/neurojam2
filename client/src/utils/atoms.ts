import { Vector3 } from "@react-three/fiber";
import { cAtomStore } from "../lib/ecs";
import { atomWithMachine, RESTART } from "jotai-xstate";
import { atom, WritableAtom } from "jotai";
import { AnyEventObject } from "xstate";
import { PlayerMachineAtom } from "../components/player/entitySchema";
import { SpawnMachine } from "../components/spawnerTile/entitySchema";

export enum Direction {
  DOWN = "down",
  LEFT = "left",
  UP = "up",
  RIGHT = "right",
}

// useAtom on this send events to an unhooked atomWithMachine
// example:
// [allMachines] = useAtom(cAtomMachine);
// const [, sendProxy] = useAtom(sendAtom);
// sendProxy([allMachines[id], { type: "unalive" }]);
export const sendProxyAtom = atom(
  null,
  (
    get,
    send,
    [machineAtom, sendEvent]: [
      WritableAtom<unknown, [AnyEventObject | typeof RESTART], unknown>,
      AnyEventObject | typeof RESTART,
    ]
  ) => {
    send(machineAtom, sendEvent);
  }
);

// same idea as above but for any atom. probably doesn't work yet
export const setAnyAtom = atom(null, (get, set, [inputAtom, value]) => {
  set(inputAtom, value);
});

export const cAtomType = cAtomStore<string>();
export const cAtomPosition = cAtomStore<Vector3>();
export const cAtomHealth = cAtomStore<number>();
export const cAtomDirection = cAtomStore<Direction>();
export const cAtomPlayerMachine = cAtomStore<PlayerMachineAtom>();
export const cAtomSpawnerMachine =
  cAtomStore<ReturnType<typeof atomWithMachine<SpawnMachine>>>();
export const cAtomMoveSpeed = cAtomStore<number>();
export const cAtomPositionCallbacks =
  cAtomStore<((id: string, position: Vector3) => void)[]>();
export const cAtomNearestSpawner = cAtomStore<string>();
export const cAtomScale = cAtomStore<Vector3>();
