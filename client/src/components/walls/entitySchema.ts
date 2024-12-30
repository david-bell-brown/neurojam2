import { useSetAtom } from "jotai";
import {
  cAtomBoolmap,
  cAtomInGroup,
  cAtomPosition,
  cAtomType,
} from "../../utils/atoms";
import { useCallback } from "react";
import { addComponent, removeComponent } from "../../lib/ecs";
import { BoolmapRoomFeature, RealRoomFeature } from "@app/lib";
import { dreiVec } from "../../utils/vector";

type WallFeature = BoolmapRoomFeature & {
  id: string;
  type: "map";
  name: "walls";
};

export function getWallsFeatures(features: RealRoomFeature[]): WallFeature[] {
  const wallFeatures = features.filter(
    (
      feature
    ): feature is RealRoomFeature & { type: "map"; data: boolean[][] } =>
      feature.type === "map" &&
      feature.class === "boolmap" &&
      feature.name === "walls"
  ) as WallFeature[];

  return wallFeatures;
}

export function useWallsEntity() {
  const setType = useSetAtom(cAtomType);
  const setPosition = useSetAtom(cAtomPosition);
  const setBoolmap = useSetAtom(cAtomBoolmap);
  const setInGroup = useSetAtom(cAtomInGroup);

  const createEntity = useCallback(
    (walls: WallFeature, groupId: string) => {
      const pos = dreiVec({ x: walls.x, z: walls.z });
      addComponent(walls.id, "walls", setType);
      addComponent(walls.id, pos, setPosition);
      addComponent(walls.id, walls.data, setBoolmap);
      addComponent(walls.id, groupId, setInGroup);
      return walls.id;
    },
    [setBoolmap, setInGroup, setPosition, setType]
  );

  const destroyEntity = useCallback(
    (id: string) => {
      removeComponent(id, setType);
      removeComponent(id, setPosition);
      removeComponent(id, setBoolmap);
      removeComponent(id, setInGroup);
    },
    [setBoolmap, setInGroup, setPosition, setType]
  );

  return { createEntity, destroyEntity };
}
