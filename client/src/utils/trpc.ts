import type { AppRouter } from "@app/server";
import {
  // createTRPCProxyClient,
  createWSClient,
  // httpLink,
  // loggerLink,
  // splitLink,
  wsLink,
} from "@trpc/client";
import { createTRPCJotai } from "@app/lib";
// import { createTRPCReact } from "@trpc/react-query";
const wsClient = createWSClient({
  url: `wss://server-bold-silence-1905.fly.dev`,
});

export const trpc = createTRPCJotai<AppRouter>({
  transformer: {
    serialize: data => data,
    deserialize: data => data,
  },
  links: [
    // loggerLink({
    //   enabled: opts =>
    //     typeof window !== "undefined" ||
    //     (opts.direction === "down" && opts.result instanceof Error),
    // }),
    wsLink({
      client: wsClient,
    }),
    // call subscriptions through websockets and the rest over http
    // splitLink({
    //   condition(op) {
    //     return op.type === "subscription";
    //   },
    //   true: wsLink({
    //     client: wsClient,
    //   }),
    //   false: httpLink({
    //     url: `http://localhost:2022`,
    //   }),
    // }),
  ],
});
