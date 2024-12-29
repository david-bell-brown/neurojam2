import { atom, SetStateAction } from "jotai";

export function cAtomStore<T>() {
  return atom<Record<string, T>>({});
}
type cAtomStore = ReturnType<typeof cAtomStore>;

export function addComponent<T>(
  entityId: string,
  initialData: T,
  setStore: (value: SetStateAction<Record<string, T>>) => void
) {
  setStore(prev => ({ ...prev, [entityId]: initialData }));
}

export function removeComponent<T>(
  entityId: string,
  setStore: (value: SetStateAction<Record<string, T>>) => void
) {
  setStore(prev => {
    const { [entityId]: _, ...rest } = prev;
    return rest;
  });
}
