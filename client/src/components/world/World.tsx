import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import { cAtomType, sessionAtomPlayerId } from "../../utils/atoms";
import { usePlayerEntity } from "../player/entitySchema";
import Player from "../player/Player";
import Enemy from "../enemy/Enemy";
import SpawnerTile from "../spawnerTile/SpawnerTile";
import Floor from "../floor/Floor";
import Walls from "../walls/Walls";
import Torch from "../torch/Torch";
import Door from "../door/Door";

const TypeRenderMap = {
  player: Player,
  enemy: Enemy,
  spawner: SpawnerTile,
  walls: Walls,
  torch: Torch,
  door: Door,
  portal: Door,
  stairs: Door,
};

export default function World() {
  const [sessionPlayerId, setSessionPlayerId] = useAtom(sessionAtomPlayerId);
  const entities = useAtomValue(cAtomType);
  const { createEntity: createPlayer, destroyEntity: destroyPlayer } =
    usePlayerEntity();

  // const playerIds = useAtomValue(playerIdsAtom);
  useEffect(() => {
    const playerId = createPlayer([0, 0, 0], "", sessionPlayerId);
    return () => {
      destroyPlayer(playerId);
    };
  }, [createPlayer, destroyPlayer, sessionPlayerId, setSessionPlayerId]);

  return (
    <group>
      <Floor />
      {Object.entries(entities).map(([id, type]) => {
        if (!TypeRenderMap[type as keyof typeof TypeRenderMap]) {
          return null;
        }
        const Component = TypeRenderMap[type as keyof typeof TypeRenderMap];
        return <Component key={id} id={id} />;
      })}
    </group>
  );
}
