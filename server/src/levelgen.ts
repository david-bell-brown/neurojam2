import { CommonRoomFeature, RoomDef } from "@app/lib";
import { nanoid } from "nanoid";

export function createRealRoom(template: RoomDef, offset: { x: number, z: number }, flip: boolean) {
    let width = template.width;
    return {
        id: nanoid(),
        x: offset.x,
        z: offset.z,
        width,
        height: template.height,
        features: template.features.map((feature) => {
            const id = nanoid();
            if (flip) {
                if (feature.type === "map") {
                    const copy = Object.assign({ id }, feature);
                    copy.data = [];
                    for (let row of feature.data) {
                        copy.data.push(Array.from(row).reverse());
                    }
                    return copy;
                } else if (feature.type === "point" || feature.type == "rect") {
                    const copy = Object.assign({ id }, feature);
                    copy.x = width - copy.x + offset.x;
                    copy.z = copy.z + offset.z;
                    return copy;
                } else {
                    throw "haven't implemented instancing for this feature type";
                }
            }
        }),
    };
}