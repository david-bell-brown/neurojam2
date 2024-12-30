import { useAtom } from "jotai";
import {
  cAtomPosition,
  cAtomScale,
} from "../../utils/atoms";
import { focusAtom } from "jotai-optics";
import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";

export default function Room({ id }: { id: string }) {
  const [positionAtom, scaleAtom] = useMemo(() => {
    const position = focusAtom(cAtomPosition, optic => optic.prop(id));
    const scale = focusAtom(cAtomScale, optic => optic.prop[id]);
    return [position, scale];
  }, [id]);

  const [position, setPosition] = useAtom(positionAtom);
  const [scale, setScale] = useAtom(scaleAtom);

  return <group />
}
