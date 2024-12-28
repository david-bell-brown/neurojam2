import type { AppRouter } from "@app/server";
import { createWSClient, wsLink } from "@trpc/client";
import { createTRPCJotai } from "@app/lib";

const wsClient = createWSClient({
  url: import.meta.env.VITE_WEBSOCKET_URL,
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
  ],
});
