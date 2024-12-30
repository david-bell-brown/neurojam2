import { router } from "./trpc";
import { createContext } from "./context";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { WebSocketServer } from "ws";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { playersRouter } from "./routers/players";
import { worldRouter } from "./routers/worldRouter";

const port = Number(process.env.PORT) || 2022;
if (isNaN(port)) throw new Error("PORT environment variable must be a number");

// Merge routers together
const appRouter = router({
  players: playersRouter,
  world: worldRouter,
});

export type AppRouter = typeof appRouter;
export type AppRouterInput = inferRouterInputs<AppRouter>;
export type AppRouterOutput = inferRouterOutputs<AppRouter>;

const wss = new WebSocketServer({
  port,
});
const handler = applyWSSHandler({ wss, router: appRouter, createContext });

wss.on("connection", ws => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once("close", () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log("✅ WebSocket Server listening on " + port);

process.on("SIGINT", () => {
  handler.broadcastReconnectNotification();
  wss.close();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM");
  handler.broadcastReconnectNotification();
  wss.close();
  process.exit(0);
});
