import { FastifyInstance } from "fastify";
import { getUserJwt } from "../utils/session.js";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

export async function tokenRoutes(app: FastifyInstance) {
  // Start connection (Descope outbound)
  app.get("/connect/:provider/:tokenName", async (req, reply) => {
    const jwt = getUserJwt(req);
    if (!jwt) return reply.status(401).send({ error: "Unauthorized" });

    const { provider, tokenName } = req.params as any;

    try {
      // Example - Descope outbound start API
      const resp = await axios.post(
        "https://api.descope.com/v1/outbound/start",
        { provider, tokenName },
        { headers: { Authorization: `Bearer ${jwt}` } }
      );

      // Record event
      await prisma.event.create({
        data: {
          type: "connection_started",
          source: provider,
          payload: { provider, tokenName, url: resp.data.url }
        }
      });

      return { url: resp.data.url };
    } catch (error) {
      return reply.status(500).send({ error: "Failed to start connection" });
    }
  });

  // Get token (Descope token broker)
  app.get("/token/:provider/:tokenName", async (req, reply) => {
    const jwt = getUserJwt(req);
    if (!jwt) return reply.status(401).send({ error: "Unauthorized" });

    const { provider, tokenName } = req.params as any;

    try {
      const resp = await axios.post(
        `https://api.descope.com/v1/token/${provider}/${tokenName}`,
        {},
        { headers: { Authorization: `Bearer ${jwt}` } }
      );

      // Upsert connection record
      await prisma.connection.upsert({
        where: {
          userId_provider_tokenName: {
            userId: "mock-user-id", // In real app, extract from JWT
            provider,
            tokenName
          }
        },
        update: {
          accountId: resp.data.accountId,
          scopes: resp.data.scopes || [],
          updatedAt: new Date()
        },
        create: {
          userId: "mock-user-id", // In real app, extract from JWT
          provider,
          tokenName,
          accountId: resp.data.accountId,
          scopes: resp.data.scopes || []
        }
      });

      // Record event
      await prisma.event.create({
        data: {
          type: "token_retrieved",
          source: provider,
          payload: { provider, tokenName, accountId: resp.data.accountId }
        }
      });

      return resp.data;
    } catch (error) {
      return reply.status(500).send({ error: "Failed to retrieve token" });
    }
  });
}