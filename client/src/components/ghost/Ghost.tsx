import { useAtomValue } from "jotai";
import { sAtomGetAllPlayers } from "../../utils/atoms";

export default function Ghost() {
  const players = useAtomValue(sAtomGetAllPlayers);
  return players.map((player, index) => (
    <group
      key={index}
      position={[player.position.x, player.position.y, player.position.z]}
    >
      <mesh key={index} position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.3, 4, 4]} />
        <meshStandardMaterial color={"red"} />
      </mesh>
    </group>
  ));
}
