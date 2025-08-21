import { FastifyInstance } from "fastify";
import { getUserJwt } from "../utils/session.js";
import axios from "axios";

export async function slackRoutes(app: FastifyInstance) {
  app.post("/slack/post", async (req, reply) => {
    const jwt = getUserJwt(req);
    if (!jwt) return reply.status(401).send({ error: "Unauthorized" });

    // Fetch token from our token broker
    const tokenResp = await axios.get(
      "http://localhost:4000/token/slack/slack_bot",
      { headers: { Authorization: `Bearer ${jwt}` } }
    );

    const accessToken = tokenResp.data.accessToken;

    await axios.post(
      "https://slack.com/api/chat.postMessage",
      { channel: "#general", text: "Hello from AI Agent 🚀" },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    return { ok: true };
  });
}
