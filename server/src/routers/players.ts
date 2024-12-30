import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";

// Event emitter for player position updates
const ee = new EventEmitter();

// emit position updates at 20 fps
setInterval(() => {
  ee.emit("positionUpdate");
}, 1000 / 20);

// Type for player position
type Player = {
  playerId: string;
  active: boolean;
  position: { x: number; y: number; z: number };
};

// Store for player positions
const players = new Map<string, Player>();

export const playersRouter = router({
  setPlayerPosition: publicProcedure
    .input(
      z.object({
        playerId: z.string().min(1),
        position: z
          .object({ x: z.number(), y: z.number(), z: z.number() })
          .strict(),
      })
    )
    .mutation(({ input }) => {
      const { playerId, position } = input;
      const existing = players.get(playerId);
      players.set(playerId, {
        playerId,
        position,
        active: true,
        // Preserve existing active state if player exists
        ...(existing && { active: existing.active }),
      });
      return { success: true };
    }),

  getPlayerPositions: publicProcedure.subscription(() => {
    return observable<Player[]>(emit => {
      const onPositionUpdate = () => {
        const positions: Player[] = Array.from(players.values()).filter(
          player => player.active
        );
        emit.next(positions);
      };

      // Emit initial positions
      onPositionUpdate();

      // Listen for position updates
      ee.on("positionUpdate", onPositionUpdate);

      // Cleanup
      return () => {
        ee.off("positionUpdate", onPositionUpdate);
      };
    });
  }),

  getAllPlayers: publicProcedure.subscription(() => {
    return observable<Player[]>(emit => {
      const onPositionUpdate = () => {
        const positions: Player[] = Array.from(players.values());
        emit.next(positions);
      };

      // Emit initial positions
      onPositionUpdate();

      // Listen for position updates
      ee.on("positionUpdate", onPositionUpdate);

      // Cleanup
      return () => {
        ee.off("positionUpdate", onPositionUpdate);
      };
    });
  }),
});
