import { FastifyRequest } from "fastify";

export function getUserJwt(req: FastifyRequest): string | null {
  if (req.cookies["DS"]) return req.cookies["DS"]; // Descope cookie
  const auth = req.headers["authorization"];
  if (auth?.startsWith("Bearer ")) return auth.substring(7);
  return null;
}
