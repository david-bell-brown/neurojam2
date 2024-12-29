import { Vector3 } from "@react-three/fiber";
import { cAtomStore } from "../lib/ecs";
import { atomWithMachine, RESTART } from "jotai-xstate";
import { atom, WritableAtom } from "jotai";
import { AnyEventObject } from "xstate";
import { PlayerMachine } from "../components/player/entitySchema";

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
export const cAtomMachine =
  cAtomStore<ReturnType<typeof atomWithMachine<PlayerMachine>>>();
export const cAtomMoveSpeed = cAtomStore<number>();
