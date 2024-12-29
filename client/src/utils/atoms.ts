import { Vector3 } from "@react-three/fiber";
import { cAtomStore } from "../lib/ecs";

export enum Direction {
  DOWN = "down",
  LEFT = "left",
  UP = "up",
  RIGHT = "right",
}

export const cAtomType = cAtomStore<string>();
export const cAtomPosition = cAtomStore<Vector3>();
export const cAtomHealth = cAtomStore<number>();
export const cAtomDirection = cAtomStore<Direction>();
