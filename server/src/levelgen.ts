import {
  CommonRoomFeature,
  RealRoom,
  RealRoomFeature,
  RoomDef,
  RoomFeature,
} from "@app/lib";
import { nanoid } from "nanoid";
import { parseMap, TiledMap } from "./tiled";

import hubJson0 from "./assets/hub-0.json";
import keyJson0 from "./assets/key-0.json";
import puzzleJson0 from "./assets/puzzle-0.json";
import puzzleJson1 from "./assets/puzzle-1.json";
import startJson0 from "./assets/start-0.json";

const hubRooms = [hubJson0].map(j => parseMap(j as TiledMap));

const puzzleRooms = [puzzleJson0, puzzleJson1].map(j =>
  parseMap(j as TiledMap)
);

const startRooms = [startJson0].map(j => parseMap(j as TiledMap));

const keyRooms = [keyJson0].map(j => parseMap(j as TiledMap));

function getRandomRoom(rooms: RoomDef[]) {
  return rooms[Math.floor(Math.random() * rooms.length)];
}

export function createRealRoom(
  template: RoomDef,
  prevOffset: { x: number; z: number }, // the position of where the entrance should be
  flip: boolean
): RealRoom {
  const width = template.width;
  const enterDoor = getEnterDoor(template.features);
  const offset = {
    x: flip
      ? prevOffset.x - (width - enterDoor.x) // If flipped, door's local x is mirrored
      : prevOffset.x - enterDoor.x,
    z: prevOffset.z - enterDoor.z,
  };
  return {
    ...template,
    id: nanoid(),
    x: offset.x,
    z: offset.z,
    width,
    features: template.features.map((feature): RealRoomFeature => {
      const id = nanoid();
      if (feature.type === "map") {
        const copy = Object.assign({ id }, feature);
        copy.x = copy.x + offset.x;
        copy.z = copy.z + offset.z;
        if (flip) {
          copy.data = [];
          for (const row of feature.data) {
            copy.data.push(Array.from(row).reverse());
          }
        }
        return copy;
      } else if (feature.type === "point" || feature.type == "rect") {
        const copy = Object.assign({ id }, feature);
        if (flip) {
          copy.x = width - copy.x + offset.x;
          copy.z = copy.z + offset.z;
        } else {
          copy.x = copy.x + offset.x;
          copy.z = copy.z + offset.z;
        }
        return copy;
      } else {
        throw "haven't implemented instancing for this feature type";
      }
    }),
  };
}

function getEnterDoor<T extends RoomFeature | RealRoomFeature>(
  features: T[]
): T extends RealRoomFeature ? T : CommonRoomFeature {
  const entrances = features.filter(
    (feature): feature is T =>
      feature.name === "enter" &&
      (feature.type === "point" || feature.type === "rect")
  );

  if (entrances.length === 0) {
    throw new Error("No entrance found in room features");
  }

  return entrances[0] as T extends RealRoomFeature ? T : CommonRoomFeature;
}
function getExitDoor(features: RealRoomFeature[]): RealRoomFeature {
  const exits = features.filter(feature => feature.name === "exit");

  if (exits.length === 0) {
    throw new Error("No entrance found in room features");
  }

  return exits[0];
}
function getPuzzleDoors(features: RealRoomFeature[]): RealRoomFeature[] {
  return features.filter(feature => feature.name === "puzzle");
}

type FloorMap = {
  roomId: string;
  entrance: {
    doorId: string;
    fromRoomId?: string;
  };
  exits: {
    doorId: string;
    toRoomId?: string;
  }[];
}[];

type Floor = {
  id: string;
  startRoomId: string;
  exitRoomId: string;
  map: FloorMap;
  roomRegistry: RealRoom[];
  password: Record<string, { symbol: string; value: number }>;
};

type CreateFloorProps = {
  hubDepth: [min: number, max: number];
  puzzleDepth: [min: number, max: number];
};
export function createFloor({
  hubDepth,
  puzzleDepth,
}: CreateFloorProps): Floor {
  const floorMap: FloorMap = [];
  const roomRegistry: RealRoom[] = [];
  const password: Record<string, { symbol: string; value: number }> = {};
  const availableSymbols = [
    "★",
    "♠",
    "♣",
    "♥",
    "♦",
    "⚡",
    "☀",
    "☘",
    "⚔",
    "⚓",
  ];
  let symbolIndex = 0;

  // Create start room
  const startRoom = createRealRoom(
    getRandomRoom(startRooms),
    { x: 0, z: 0 },
    false
  );
  const startRoomEntrance = getEnterDoor(startRoom.features);
  const startRoomExit = getExitDoor(startRoom.features);

  // Initialize first hub
  const firstHub = createRealRoom(
    getRandomRoom(hubRooms),
    { x: startRoomEntrance.x, z: startRoomExit.z - 1 },
    false
  );

  roomRegistry.push(startRoom);
  floorMap.push({
    roomId: startRoom.id,
    entrance: { doorId: startRoomEntrance.id },
    exits: [
      {
        doorId: startRoomExit.id,
        toRoomId: firstHub.id,
      },
    ],
  });

  // Create hub chain
  const hubChainDepth =
    Math.floor(Math.random() * (hubDepth[1] - hubDepth[0] + 1)) + hubDepth[0];
  let currentHub = firstHub;
  let previousHub = startRoom;
  const hubEnterDoor = getEnterDoor(currentHub.features);
  const hubExitDoor = getExitDoor(currentHub.features);
  // let lastRoomId: string = firstHub.id;

  for (let i = 0; i < hubChainDepth; i++) {
    // Create puzzle chains for each puzzle door
    const hubPuzzleDoors = getPuzzleDoors(currentHub.features);

    const puzzleChains = hubPuzzleDoors.map(puzzleDoor => {
      const flipped = puzzleDoor.properties.side === "left" ? true : false;

      const puzzleChainDepth =
        Math.floor(Math.random() * (puzzleDepth[1] - puzzleDepth[0] + 1)) +
        puzzleDepth[0];
      const firstPuzzleRoom = createRealRoom(
        getRandomRoom(puzzleRooms),
        {
          x: flipped ? puzzleDoor.x - 1 : puzzleDoor.x + 1,
          z: puzzleDoor.z,
        },
        flipped
      );
      // Add key room at end of chain
      // const keyRoom = createRealRoom(
      //   getRandomRoom(keyRooms),
      //   { x: 0, z: 0 },
      //   flipped
      // );

      let currentPuzzleRoom = firstPuzzleRoom;
      let previousRoom: RealRoom = currentHub;

      // Build puzzle chain
      for (let j = 0; j < puzzleChainDepth; j++) {
        const currentEntrance = getEnterDoor(currentPuzzleRoom.features);
        const currentExit = getExitDoor(currentPuzzleRoom.features);
        // const nextEntrance = getEnterDoor(nextPuzzleRoom.features);

        // next room is key room after last step
        const nextRoom =
          j < puzzleRooms.length - 2
            ? createRealRoom(
                getRandomRoom(puzzleRooms),
                {
                  x: flipped ? currentExit.x - 1 : currentExit.x + 1,
                  z: currentExit.z,
                },
                flipped
              )
            : createRealRoom(
                getRandomRoom(keyRooms),
                {
                  x: flipped ? currentExit.x - 1 : currentExit.x + 1,
                  z: currentExit.z,
                },
                flipped
              );

        roomRegistry.push(currentPuzzleRoom);
        floorMap.push({
          roomId: currentPuzzleRoom.id,
          entrance: {
            doorId: currentEntrance.id,
            fromRoomId: previousRoom.id,
          },
          exits: [
            {
              doorId: currentExit.id,
              toRoomId: nextRoom.id,
            },
          ],
        });

        previousRoom = currentPuzzleRoom;
        currentPuzzleRoom = nextRoom;
      }

      const keyRoomEntrance = getEnterDoor(currentPuzzleRoom.features);
      const keyRoomExit = getExitDoor(currentPuzzleRoom.features);

      // this is actually a key room
      roomRegistry.push(currentPuzzleRoom);
      floorMap.push({
        roomId: currentPuzzleRoom.id,
        entrance: {
          doorId: keyRoomEntrance.id,
          fromRoomId: previousRoom.id,
        },
        exits: [
          {
            doorId: keyRoomExit.id,
          },
        ],
      });
      password[currentPuzzleRoom.id] = {
        symbol: availableSymbols[symbolIndex++],
        value: Math.floor(Math.random() * 10),
      };

      return {
        doorId: puzzleDoor.id,
        toRoomId: firstPuzzleRoom.id,
      };
    });

    if (i < hubChainDepth - 1) {
      const nextHub = createRealRoom(
        getRandomRoom(hubRooms),
        { x: 0, z: 0 },
        false
      );
      // const nextHubEntrance = getEnterDoor(nextHub.features);

      roomRegistry.push(currentHub);
      floorMap.push({
        roomId: currentHub.id,
        entrance: {
          doorId: hubEnterDoor.id,
          fromRoomId: previousHub.id,
        },
        exits: [
          {
            doorId: hubExitDoor.id,
            toRoomId: nextHub.id,
          },
          ...puzzleChains,
        ],
      });

      previousHub = currentHub;
      currentHub = nextHub;
    } else {
      // Last hub
      roomRegistry.push(currentHub);
      floorMap.push({
        roomId: currentHub.id,
        entrance: {
          doorId: hubEnterDoor.id,
          fromRoomId: previousHub.id,
        },
        exits: [
          {
            doorId: hubExitDoor.id,
          },
        ],
      });

      // Create minimum viable RealRoom with class "password"
      const passwordRoomWidth = Math.max(
        Object.values(password).length * 2,
        11
      );
      const passwordRoom = createRealRoom(
        {
          class: "password",
          properties: {},
          height: 20,
          width: passwordRoomWidth,
          features: [
            {
              class: "door",
              name: "enter",
              type: "rect",
              x: Math.ceil(passwordRoomWidth / 2),
              z: 20,
              width: 1,
              height: 1,
              properties: {},
              layerIndex: 0,
              tiled_id: 0,
            },
            {
              class: "stairs",
              name: "exit",
              type: "rect",
              x: Math.ceil(passwordRoomWidth / 2),
              z: 0,
              width: 1,
              height: 1,
              properties: {},
              layerIndex: 0,
              tiled_id: 0,
            },
          ],
          layers: [],
          tilesets: [],
        },
        { x: hubExitDoor.x, z: hubExitDoor.z - 1 },
        false
      );
      const passwordEnterDoor = getEnterDoor(passwordRoom.features);
      const passwordExitDoor = getExitDoor(passwordRoom.features);

      roomRegistry.push(passwordRoom);
      floorMap.push({
        roomId: passwordRoom.id,
        entrance: {
          doorId: passwordEnterDoor.id,
          fromRoomId: currentHub.id,
        },
        exits: [
          {
            doorId: passwordExitDoor.id,
          },
        ],
      });
    }
  }

  return {
    id: nanoid(),
    startRoomId: startRoom.id,
    exitRoomId: floorMap[floorMap.length - 1].roomId,
    map: floorMap,
    roomRegistry,
    password,
  };
}
