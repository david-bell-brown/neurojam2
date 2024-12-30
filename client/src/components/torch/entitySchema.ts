import { useSetAtom } from "jotai";
import {
  cAtomInGroup,
  cAtomPosition,
  cAtomSleep,
  cAtomType,
} from "../../utils/atoms";
import { useCallback } from "react";
import { addComponent, removeComponent } from "../../lib/ecs";
import { PointRoomFeature, RealRoomFeature } from "@app/lib";
import { dreiVec } from "../../utils/vector";

type TorchFeature = PointRoomFeature & {
  id: string;
  class: "torch";
};

export function getTorchFeatures(features: RealRoomFeature[]): TorchFeature[] {
  const torchFeatures = features.filter(
    (feature): feature is RealRoomFeature & { type: "point"; class: "torch" } =>
      feature.type === "point" && feature.class === "torch"
  ) as TorchFeature[];

  return torchFeatures;
}

export function useTorchEntity() {
  const setType = useSetAtom(cAtomType);
  const setPosition = useSetAtom(cAtomPosition);
  const setSleep = useSetAtom(cAtomSleep);
  const setInGroup = useSetAtom(cAtomInGroup);

  const createEntity = useCallback(
    (torch: TorchFeature, groupId: string, sleep: boolean = false) => {
      const pos = dreiVec({ x: torch.x, z: torch.z });
      addComponent(torch.id, "torch", setType);
      addComponent(torch.id, pos, setPosition);
      addComponent(torch.id, sleep, setSleep);
      addComponent(torch.id, groupId, setInGroup);
      return torch.id;
    },
    [setInGroup, setPosition, setSleep, setType]
  );

  const destroyEntity = useCallback(
    (id: string) => {
      removeComponent(id, setType);
      removeComponent(id, setPosition);
      removeComponent(id, setSleep);
      removeComponent(id, setInGroup);
    },
    [setInGroup, setPosition, setSleep, setType]
  );

  return { createEntity, destroyEntity };
}
