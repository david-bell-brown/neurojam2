import { useAtomValue, useSetAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { useCallback, useMemo } from "react";
import {
  cAtomPosition,
  cAtomInGroup,
  cAtomTags,
  cAtomCurrentRoom,
} from "../../utils/atoms";
import {
  CollisionPayload,
  CuboidCollider,
  RigidBody,
} from "@react-three/rapier";

export default function Door({ id }: { id: string }) {
  const [positionAtom, inGroupAtom, tagsAtom] = useMemo(
    () => [
      focusAtom(cAtomPosition, optic => optic.prop(id)),
      focusAtom(cAtomInGroup, optic => optic.prop(id)),
      focusAtom(cAtomTags, optic => optic.prop(id)),
    ],
    [id]
  );
  const position = useAtomValue(positionAtom);
  const inGroup = useAtomValue(inGroupAtom);
  const _tags = useAtomValue(tagsAtom);
  const setOtherCurrentRoom = useSetAtom(cAtomCurrentRoom);

  const onIntersectionEnter = useCallback(
    ({ other }: CollisionPayload) => {
      const rigidBody = other.rigidBodyObject;
      if (!rigidBody || !rigidBody.name) {
        return;
      }
      setOtherCurrentRoom(prev => ({ ...prev, [rigidBody.name]: inGroup }));
    },
    [inGroup, setOtherCurrentRoom]
  );

  return (
    <RigidBody
      type="kinematicPosition"
      position={position}
      colliders={false}
      name={id}
    >
      <CuboidCollider
        args={[0.5, 0.5, 0.5]}
        position={[0, 0.5, 0]}
        sensor
        onIntersectionEnter={onIntersectionEnter}
      />
      <mesh position={[0, 0.1, 0]} rotation={[Math.PI / -2, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </RigidBody>
  );
}
