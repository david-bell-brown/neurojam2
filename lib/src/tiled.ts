// RAW JSON STRUCTURES
interface TiledExternTileset {
    firstgid: number,
    source: string,
}
interface TiledProperty {
    name: string,
    type: "bool" | "color" | "int" | "string" | "float" | "object",
    value: number | string,
}
interface TiledTileset {
    firstgid: number,
    name: string,
    columns: number,
    margin: number,
    spacing: number,
    tilecount: number,
    tileheight: number, // assume these == map tileheight/width
    tilewidth: number,
    image?: string,
    imageheight?: number,
    imagewidth?: number,
    class?: string,
    tiles?: Array<{
        id: number,
        properties?: TiledProperty[],
        type?: string, // class
        x?: number,
        y?: number,
        height?: number,
        width?: number,
        image?: string,
        imagewidth?: number,
        imageheight?: number,
    }>,
    properties?: TiledProperty[],
    // ignore tilerendersize -- assume it is always "tile"
    // ignore objectalignment -- doesn't appear to have an affect!
}
interface TiledImageLayer {
    type: "imagelayer",
    id: number,
    name: string,
    image: string,
    class?: string,
    properties?: TiledProperty[],
    // ignore opacity, visible, x, y, repeat
}
interface TiledTileLayer {
    type: "tilelayer",
    id: number,
    data: number[],
    name: string,
    class?: string,
    properties?: TiledProperty[],
    // ignore opacity, visible, x, y, width, height
}
interface TiledObjectLayer {
    type: "objectgroup",
    id: number,
    objects: any[],
    name: string,
    class?: string,
    properties?: TiledProperty[],
    // ignore draworder, visible, x, y, opacity
}
interface TiledGroupLayer {
    type: "group",
    id: number,
    layers: Array<TiledGroupLayer|TiledObjectLayer|TiledTileLayer|TiledImageLayer>,
    name: string,
    class?: string,
    properties?: TiledProperty[],
    // ignore opacity, visible, x, y
}
type TiledLayer = TiledImageLayer | TiledTileLayer | TiledObjectLayer | TiledGroupLayer;
interface TiledMap {
    height: number,
    width: number,
    tileheight: number,
    tilewidth: number,
    layers: Array<TiledLayer>,
    tilesets: Array<TiledExternTileset | TiledTileset>,
    class?: string,
    properties?: TiledProperty[],
    orientation: "orthogonal", // not handling other types for now! (“isometric”, “staggered”, “hexagonal”)
    version: "1.10",
    // drop renderorder (irrelevant unless tileset tiles are larger than the map tiles)
}

// OUTPUT STRUCTURES
export interface HasMetadata {
    class: string,
    properties: Record<string, string|number>,
}

export interface Entity {
    type: string,
    x: number,
    z: number, // was y
    layerIndex: number,
}
export interface BoolmapEntity extends HasMetadata {
    type: "map",
    name: string,
    data: boolean[][],
    layerIndex: number,
}
export interface ObjectEntity extends Entity, HasMetadata {
    tiled_id: number, // was id
    name: string,
    // links: Record<string, number>,
    // drop rotation, visible
}

export interface PointEntity extends ObjectEntity {
    type: "point",
}
export interface RectEntity extends ObjectEntity {
    type: "rect", // doesn't match any other type
    width: number,
    height: number,
}
export type AnyEntity = BoolmapEntity | PointEntity | RectEntity;
// not implemented yet! TileEntity | ImageEntity | EllipseEntity | PathEntity | TextEntity

export interface MapLayer extends HasMetadata {
    name: string,
    tiled_id: number, // was "id"
    type: "map" | "object" | "group", // others not implemented
    parentIndex: number | null,
    // drop paralax, offset, tint, locked, visible, opacity
}

export interface ParsedMap extends HasMetadata {
    height: number,
    width: number,
    entities: AnyEntity[],
    layers: MapLayer[],
    tilesets: [], // TileSet[]
    // drop tilewidth/height for now; they're not very useful to us
}

function flattenProps(properties: TiledProperty[] = []): Record<string, string|number> {
    let result = {};
    for (let prop of properties) {
        if (prop.type === "object") continue; // handled separately
        result[prop.name] = prop.value;
    }
    return result;
}

/*
function parsegid(gid: number, tilesets: Array<Readonly<TileSet>>) {
    let realGid = gid & 0x0FFFFFFF;
    return {
        set: 0,
        tile: 0,
        flipX: gid & 0x80000000,
        flipY: gid & 0x40000000,
        flipZ: gid & 0x20000000,
    }
}
*/

function objToEntity(obj, layerIndex: number, xUnit: number, zUnit: number): AnyEntity {

    if (obj.point === true) {
        let entity: PointEntity = {
            type: "point",
            tiled_id: obj.id,
            name: obj.name,
            x: obj.x / xUnit,
            z: obj.y / zUnit,
            layerIndex,
            class: obj.type || "",
            properties: flattenProps(obj.properties),
        };
        return entity;
    } else if (
        obj.hasOwnProperty("text") ||
        obj.hasOwnProperty("gid") ||
        obj.hasOwnProperty("polyline") ||
        obj.hasOwnProperty("polygon") ||
        obj.hasOwnProperty("ellipse") ||
        false
    ) {
        console.warn(`discarded unsupported object type`);
        return;
    } else {
        // assume rect
        let entity: RectEntity = {
            type: "rect",
            x: obj.x / xUnit,
            z: obj.y / zUnit,
            width: obj.width / xUnit,
            height: obj.height / zUnit,
            layerIndex,
            tiled_id: obj.id,
            name: obj.name,
            class: obj.type || "",
            properties: flattenProps(obj.properties),
        };
        return entity;
    }
}

export function parseMap(rawData: TiledMap, /*images: ImageCache = defaultCache*/): ParsedMap {
    // let entityIdMap: Record<number, number> = {};
    let result: ParsedMap = {
        height: rawData.height,
        width: rawData.width,
        entities: [],
        layers: [],
        tilesets: [],
        class: rawData.class || "",
        properties: flattenProps(rawData.properties),
    };
    let tilesetStarts = [];
    /*
    for (let record of rawData.tilesets) {
        if (record.hasOwnProperty("source")) {
            throw "can't handle external tilesets yet";
        } else {
            let set = parseTileset(record as TiledTileset, images)
            tilesetStarts.push(record.firstgid);
            result.tilesets.push(set);
        }
    }
    */
    function walkLayers(layers: Array<TiledLayer>, parent: number|null = null) {
        for (let layer of layers) {
            let commonLayerData = {
                class: layer.class || "",
                properties: flattenProps(layer.properties),
                name: layer.name,
                parentIndex: parent,
                tiled_id: layer.id,
            };
            if (layer.type === "group") {
                result.layers.push({
                    ...commonLayerData,
                    type: "group",
                });
                walkLayers(layer.layers, result.layers.length-1);
            } else if (layer.type === "tilelayer" && layer.class === "boolmap") {
                result.layers.push({
                    ...commonLayerData,
                    type: "map",
                });
                let bools = layer.data.map(gid => gid===0 ? false : true);
                let data = [];
                for (let i = 0; i < result.height; i++) {
                    data.push(
                        bools.slice(i*result.width, (i+1)*result.width)
                    );
                }
                result.entities.push({
                    type: "map",
                    name: layer.name,
                    data,
                    layerIndex: result.layers.length-1,
                    class: layer.class,
                    properties: {},
                });
            } else if (layer.type === "tilelayer") {
                console.warn(`discarded tileset-based map layer "${layer.name}" (not supported yet)`);
            } else if (layer.type === "objectgroup") {
                result.layers.push({
                    ...commonLayerData,
                    type: "object",
                });
                let thisLayerIndex = result.layers.length-1;
                layer.objects.forEach(obj => {
                    let entity: AnyEntity = objToEntity(
                        obj,
                        thisLayerIndex,
                        rawData.tilewidth,
                        rawData.tileheight,
                    );
                    if (entity) result.entities.push(entity);
                });
            } else {
                console.warn(`discarded unsupported layer type "${layer.type}"`);
            }
        }
    }
    walkLayers(rawData.layers);
    
    return result;
}