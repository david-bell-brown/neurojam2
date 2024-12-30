import { PointRoomFeature, RectRoomFeature, RoomDef, RoomFeature } from "@app/lib";

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
//////////

function flattenProps(properties: TiledProperty[] = []): Record<string, string|number|boolean> {
    let result = {};
    for (let prop of properties) {
        if (prop.type === "object") continue; // handled separately
        result[prop.name] = prop.value;
    }
    return result;
}

function objToFeature(obj: any, layerIndex: number, xUnit: number, zUnit: number): RoomFeature|undefined {
    if (obj.point === true) {
        let entity: PointRoomFeature = {
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
        let width = obj.width / xUnit;
        let height = obj.height / zUnit;
        let entity: RectRoomFeature = {
            type: "rect",
            x: (obj.x / xUnit) + (width / 2),
            z: (obj.y / zUnit) + (height / 2),
            width,
            height,
            layerIndex,
            tiled_id: obj.id,
            name: obj.name,
            class: obj.type || "",
            properties: flattenProps(obj.properties),
        };
        return entity;
    }
}

export function parseMap(rawData: TiledMap, /*images: ImageCache = defaultCache*/): RoomDef {
    // let entityIdMap: Record<number, number> = {};
    let result: RoomDef = {
        height: rawData.height,
        width: rawData.width,
        features: [],
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
                let data: boolean[][] = [];
                for (let i = 0; i < result.height; i++) {
                    data.push(
                        bools.slice(i*result.width, (i+1)*result.width)
                    );
                }
                result.features.push({
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
                    let entity: RoomFeature|undefined = objToFeature(
                        obj,
                        thisLayerIndex,
                        rawData.tilewidth,
                        rawData.tileheight,
                    );
                    if (entity) result.features.push(entity);
                });
            } else {
                console.warn(`discarded unsupported layer type "${layer.type}"`);
            }
        }
    }
    walkLayers(rawData.layers);
    return result;
}

/*
const objects: [
    // point
    {
        type: "point", //point: true
        name: "description",
        properties: [], // TODO
        class: "foo", // was "type"
        x: 34.354, // NORMALIZE by tile size
        z: 43.53, // NORMALIZE by tile size, was "y"
    },
    // ellipse
    {
        type: "ellipse", // ellipse: true
        name: "description",
        class: "foo", // was "type"
        // assert rotation==0 for now
        x: 3.43, // NORMALIZE by tile size and center by "width"
        z: 42.42, // NORMALIZE by tile size and cetner by "height"
        rx: 23.23, // half "width"
        rz: 43.222, // half "height"
    },
    // polygon
    {
        type: "polygon", // polygon: [] exists
        name: "description",
        points: [ // from "polygon"
            {
                x: 34.5, // NORMALIZE by adding object.x, divide by tile size
                z: 12.4 // was "y". NORMALIZE by adding object.y, divide by tile size
            },
        ],
        // assert rotation==0
        class: "collision", // was "type"

    },
    // polyline
    {
        type: "polyline", // polyline: [] exists
        name: "description",
        // assert rotation==0; not useful
        class: "foo", // was "type"
        points: [
            {
                x: 2.34, // (polyline[0].x - x) / tileWidth
                z: 4.3 // (polyline[0].y - y) / tileHeight
            }
        ]
    },
    // image tile
    {
        type: "overlay", // has "gid"
        height: 23, // NORMALIZE by tile size
        width: 43.2, // NORMALIZE by tile size
        x: 4.3, // NORMALIZE by tile size, center
        z: 4.54, // was "y". NORMALIZE by tile size, center
        // assert rotation==0 for now
        tile: {
            // GENERATE ME
            // from gid, as with tile layer data
        }
    },
    // text
    {
        type: "text", // has "text" key
        // defaults:
        // left top
        // sans-serif 16px
        // word-wrap
        x: 4.3,
        z: 5.5,
        height: 43.5,
        width: 35.2,
        text: "hello world", // text.text
        valign: "top", // text.halign
        halign: "left", // text.valign
        font: {
            family: "sans-serif", // text.fontfamily
            size: 16, // text.pixelsize
            bold: false, // text.bold
            // unused italic, strikeout, underline, kerning, wordwrap
        }
    },
    // else rect
    {
        // id not useful
        type: "rect", // generated
        name: "description",
        height: 5.5,
        width: 4.5,
        x: 89,
        y: 83.53,
        // assert rotation==0 for now
        class: "doorway", // was "type"
        properties: [],
    },
]
*/