import { useAtomValue } from "jotai";
import { cAtomPosition } from "../../utils/atoms";
import { focusAtom } from "jotai-optics";
import { useMemo } from "react";

export default function Room({ id }: { id: string }) {
  const [positionAtom] = useMemo(
    () => [focusAtom(cAtomPosition, optic => optic.prop(id))],
    [id]
  );

  const position = useAtomValue(positionAtom);

  return <group position={position} />;
}
