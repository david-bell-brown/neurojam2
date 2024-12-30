import { useAtom, useAtomValue } from "jotai";
import { sAtomLatestFloorRooms, sessionAtomPlayerId } from "../../utils/atoms";
import { useCallback, useEffect } from "react";
import { RigidBody } from "@react-three/rapier";
import { useRoomEntity } from "../room/entitySchema";
import { getWallsFeatures, useWallsEntity } from "../walls/entitySchema";
import { getTorchFeatures, useTorchEntity } from "../torch/entitySchema";
import { getDoorFeatures, useDoorEntity } from "../door/entitySchema";
import {
  getSpawnerFeatures,
  useSpawnerEntity,
} from "../spawnerTile/entitySchema";
import { usePlayerEntity } from "../player/entitySchema";
import { Vector3 } from "@react-three/fiber";

export default function Floor() {
  const [rooms, _refresh] = useAtom(sAtomLatestFloorRooms);
  const { updateEntity: updatePlayer } = usePlayerEntity();
  const { createEntity: createRoom, destroyEntity: destroyRoom } =
    useRoomEntity();
  const { createEntity: createWalls, destroyEntity: destroyWalls } =
    useWallsEntity();
  const { createEntity: createTorch, destroyEntity: destroyTorch } =
    useTorchEntity();
  const { createEntity: createDoor, destroyEntity: destroyDoor } =
    useDoorEntity();
  const { createEntity: createSpawner, destroyEntity: destroySpawner } =
    useSpawnerEntity();

  const sessionPlayerId = useAtomValue(sessionAtomPlayerId);

  const spawnerCallback = useCallback(
    (spawnerId: string, pos: Vector3) => {
      console.log("spawn callback");
      updatePlayer(sessionPlayerId, {
        position: pos,
        nearestSpawner: spawnerId,
      });
    },
    [sessionPlayerId, updatePlayer]
  );
  useEffect(() => {
    // console.log(rooms);
    const wallsIds: string[] = [];
    const torchIds: string[] = [];
    const doorIds: string[] = [];
    const spawnerIds: string[] = [];
    for (const room of rooms) {
      // console.log(getWallsFeatures(room.features));
      wallsIds.push(
        ...getWallsFeatures(room.features).map(walls =>
          createWalls(walls, room.id)
        )
      );
      torchIds.push(
        ...getTorchFeatures(room.features).map(torch =>
          createTorch(torch, room.id)
        )
      );
      doorIds.push(
        ...getDoorFeatures(room.features).map(door => createDoor(door, room.id))
      );
      spawnerIds.push(
        ...getSpawnerFeatures(room.features).map(spawner =>
          createSpawner(spawner, room.id, spawnerCallback)
        )
      );
      createRoom(room);
    }

    return () => {
      wallsIds.forEach(destroyWalls);
      torchIds.forEach(destroyTorch);
      doorIds.forEach(destroyDoor);
      spawnerIds.forEach(destroySpawner);
      rooms.forEach(({ id }) => destroyRoom(id));
    };
  }, [
    createDoor,
    createRoom,
    createSpawner,
    createTorch,
    createWalls,
    destroyDoor,
    destroyRoom,
    destroySpawner,
    destroyTorch,
    destroyWalls,
    rooms,
    spawnerCallback,
  ]);
  return (
    <group>
      <ambientLight intensity={0.1} />

      <RigidBody type="fixed">
        <mesh rotation={[Math.PI / -2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshLambertMaterial color="#eeeeee" />
        </mesh>
      </RigidBody>
    </group>
  );
}
