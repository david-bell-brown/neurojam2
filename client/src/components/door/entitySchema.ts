import { useSetAtom } from "jotai";
import {
  cAtomInGroup,
  cAtomPosition,
  cAtomTags,
  cAtomType,
} from "../../utils/atoms";
import { useCallback } from "react";
import { addComponent, removeComponent } from "../../lib/ecs";
import { RealRoomFeature, RectRoomFeature } from "@app/lib";
import { dreiVec } from "../../utils/vector";

type DoorFeature = RectRoomFeature & {
  id: string;
  class: "door" | "portal" | "stairs";
};

export function getDoorFeatures(features: RealRoomFeature[]): DoorFeature[] {
  const torchFeatures = features.filter(
    (
      feature
    ): feature is RealRoomFeature & {
      type: "rect";
      class: DoorFeature["class"];
    } =>
      feature.type === "rect" &&
      ["door", "portal", "stairs"].includes(feature.class)
  ) as DoorFeature[];

  return torchFeatures;
}

export function useDoorEntity() {
  const setType = useSetAtom(cAtomType);
  const setPosition = useSetAtom(cAtomPosition);
  const setInGroup = useSetAtom(cAtomInGroup);
  const setTags = useSetAtom(cAtomTags);

  const createEntity = useCallback(
    (door: DoorFeature, groupId: string) => {
      const pos = dreiVec({ x: door.x, z: door.z });
      addComponent(door.id, door.class, setType);
      addComponent(door.id, pos, setPosition);
      addComponent(door.id, groupId, setInGroup);
      addComponent(door.id, [door.name], setTags);
      return door.id;
    },
    [setInGroup, setPosition, setTags, setType]
  );

  const destroyEntity = useCallback(
    (id: string) => {
      removeComponent(id, setType);
      removeComponent(id, setPosition);
      removeComponent(id, setInGroup);
      removeComponent(id, setTags);
    },
    [setInGroup, setPosition, setTags, setType]
  );

  return { createEntity, destroyEntity };
}
