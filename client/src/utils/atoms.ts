import { Vector3 } from "@react-three/fiber";
import { cAtomStore } from "../lib/ecs";
import { atomWithMachine, RESTART } from "jotai-xstate";
import { atom, WritableAtom } from "jotai";
import { AnyEventObject } from "xstate";
import { PlayerMachineAtom } from "../components/player/entitySchema";
import { SpawnMachine } from "../components/spawnerTile/entitySchema";
import { trpc } from "./trpc";
import { atomWithStorage } from "jotai/vanilla/utils";
import { nanoid } from "nanoid";

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

// game state
export const gAtomCurrentRoom = atom(
  get => get(cAtomCurrentRoom)[get(sessionAtomPlayerId)]
);

// component stores
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
export const cAtomInGroup = cAtomStore<string>();
export const cAtomBoolmap = cAtomStore<boolean[][]>();
export const cAtomSleep = cAtomStore<boolean>();
export const cAtomCurrentRoom = cAtomStore<string>();
export const cAtomTags = cAtomStore<string[]>();

// server data
export const sAtomGetPlayerPositions =
  trpc.players.getPlayerPositions.atomWithSubscription();
export const sAtomSetPlayerPositions =
  trpc.players.setPlayerPosition.atomWithMutation();
export const sAtomGetAllPlayers =
  trpc.players.getAllPlayers.atomWithSubscription();
export const sAtomLatestFloorRooms =
  trpc.world.latestFloor.allRooms.atomWithQuery();

// session data
export const sessionAtomPlayerId = atomWithStorage<string>(
  "playerId",
  nanoid()
);
