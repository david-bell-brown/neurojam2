interface HasMetadata {
    class: string,
    properties: Record<string, string|number|boolean>,
}

export interface CommonRoomFeature extends HasMetadata {
    name: string,
    x: number,
    z: number, // was y
    layerIndex: number,
    tiled_id: number, // was id
    // links: Record<string, number>,
    // drop rotation, visible
}
export interface BoolmapRoomFeature extends HasMetadata {
    type: "map",
    name: string,
    data: boolean[][],
    layerIndex: number,
}
export interface PointRoomFeature extends CommonRoomFeature {
    type: "point",
}
export interface RectRoomFeature extends CommonRoomFeature {
    type: "rect", // doesn't match any other type
    width: number,
    height: number,
}
export type RoomFeature = BoolmapRoomFeature | PointRoomFeature | RectRoomFeature;
// not implemented yet! tile, image ellipse, path, text

export interface RoomLayer extends HasMetadata {
    name: string,
    tiled_id: number, // was "id"
    type: "map" | "object" | "group", // others not implemented
    parentIndex: number | null,
    // drop paralax, offset, tint, locked, visible, opacity
}

export interface RoomDef extends HasMetadata {
    height: number,
    width: number,
    features: RoomFeature[],
    layers: RoomLayer[],
    tilesets: []
    // drop tilewidth/height for now; they're not very useful to us
}

export type RealRoomFeature = RoomFeature & { id: string };
export type RealRoom = {
    id: string,
    x: number,
    z: number,
    height: number,
    width: number,
    features: RealRoomFeature[],
    layers: RoomLayer[],
    tilesets: []
};

/*
export interface Tile extends HasMetadata {
    image: {
        index: string|number,
        x: number,
        y: number,
        width: number,
        height: number
    },
}
export interface TileSet extends HasMetadata {
    name: string,
    tiles: Tile[],
}

interface TileRef {
    setIndex: number,
    tileIndex: number,
    flipX: boolean,
    flipY: boolean,
    flipZ: boolean,

}
interface TileEntity extends Entity, TileRef {
    type: "tile", // from tile layer
}
interface ImageEntity extends ObjectEntity, TileRef {
    type: "image",
    height: number,
    width: number,
}
interface EllipseEntity extends ObjectEntity {
    type: "ellipse",
    rx: number,
    rz: number,
}
interface PathEntity extends ObjectEntity {
    type: "path", // has "polyline" or "polygon" key
    // own x,y at center of bounds? or just 0,0 for now
    points: Array<{
        x: number,
        z: number, // was y
    }>,
    closed: boolean, // true if polygon
}
interface TextEntity extends ObjectEntity {
    type: "text", // has "text" key
    text: string,
    font: {
        family: string, // text.fontfamily, default=sans-serif
        size: number,   // text.pixelsize, default=16px
        color: string, // text.color, default=#FF000000 (alpha, r, g, g)
        // dropped valign, halign, bold, italic, wrap
    },
    width: number,
    height: number,
}
*/