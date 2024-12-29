import { atom } from "jotai";

export function cAtomStore<T>() {
  return atom<Record<string, T>>({});
}
type cAtomStore = ReturnType<typeof cAtomStore>;
