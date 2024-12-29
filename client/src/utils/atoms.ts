import { Vector3 } from "@react-three/fiber";
import { cAtomStore } from "../lib/ecs";

export const entityTypes = ["player", "enemy", "test"] as const;

export const cAtomType = cAtomStore<(typeof entityTypes)[number]>();
export const cAtomPosition = cAtomStore<Vector3>();
export const cAtomHealth = cAtomStore<number>();
