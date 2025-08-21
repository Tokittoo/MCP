import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { tokenRoutes } from "./routes/tokens.js";
import { slackRoutes } from "./routes/slack.js";

const app = Fastify();

// Middlewares
await app.register(cors, {
  origin: ["http://localhost:3000"],
  credentials: true,
});
await app.register(cookie);

// Health check
app.get("/healthz", async () => {
  return { ok: true };
});

// Routes
await app.register(tokenRoutes);
await app.register(slackRoutes);

// Start server
app.listen({ port: 4000 }, () => {
  console.log("✅ API running at http://localhost:4000");
});
