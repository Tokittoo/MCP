// apps/api/src/server.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const server = Fastify({ logger: true });

// Middleware
server.register(cors, {
  origin: ["http://localhost:3000"],
  credentials: true,
});
server.register(cookie);

// Health check
server.get("/healthz", async () => ({ ok: true }));

// Helper: extract Descope session token (from cookie or Authorization header)
function getToken(req: any): string | null {
  const cookieToken = req.cookies["DS"];
  const headerAuth = req.headers["authorization"];
  if (cookieToken) return cookieToken;
  if (headerAuth?.startsWith("Bearer ")) return headerAuth.split(" ")[1];
  return null;
}

// Example protected endpoint
server.get("/events", async (req, reply) => {
  const token = getToken(req);
  if (!token) return reply.status(401).send({ error: "Missing token" });

  // TODO: Verify JWT via Descope SDK
  // For now assume a user id
  const userId = "mock-user-id";

  const events = await prisma.event.findMany({ where: { userId } });
  return events;
});

server.listen({ port: 4000 }).then(() => {
  console.log("🚀 Server running on http://localhost:4000");
});
// /connect/:provider/:tokenName
server.get("/connect/:provider/:tokenName", async (req, reply) => {
  const { provider, tokenName } = req.params as any;
  const token = getToken(req);
  if (!token) return reply.status(401).send({ error: "Missing token" });

  // Call Descope outbound API to start connection (pseudo-code)
  // const res = await axios.post("https://api.descope.com/v1/outbound/connect", {...});
  const url = `https://consent.${provider}.com/example`;

  return { url };
});

// /token/:provider/:tokenName
server.get("/token/:provider/:tokenName", async (req, reply) => {
  const { provider, tokenName } = req.params as any;
  const token = getToken(req);
  if (!token) return reply.status(401).send({ error: "Missing token" });

  // Call Descope Token Broker API (pseudo-code)
  const result = {
    accessToken: "mock-access-token",
    expiresAt: Date.now() + 3600 * 1000,
    scopes: ["read", "write"],
    accountId: "123",
  };

  return result;
});
server.post("/slack/post", async (req, reply) => {
  const token = getToken(req);
  if (!token) return reply.status(401).send({ error: "Missing token" });

  // TODO: call /token/slack/slack_bot first
  // const { accessToken } = await axios.get("http://localhost:4000/token/slack/slack_bot");

  // Mock: pretend Slack message sent
  return { ok: true, message: "Posted to Slack" };
});

