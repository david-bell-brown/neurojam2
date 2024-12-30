import { createFloor } from "../levelgen";
import { publicProcedure, router } from "../trpc";

const floor = createFloor({
  hubDepth: [1, 1],
  puzzleDepth: [1, 1],
});
// console.log(JSON.stringify(floor));

export const worldRouter = router({
  latestFloor: router({
    allRooms: publicProcedure.query(() => {
      return floor.roomRegistry;
    }),
  }),
});
