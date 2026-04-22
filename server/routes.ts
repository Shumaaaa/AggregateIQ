import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertAggregateSchema, insertSessionSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Sessions
  app.get("/api/sessions", (_req, res) => {
    res.json(storage.getSessions());
  });

  app.post("/api/sessions", (req, res) => {
    const parsed = insertSessionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(storage.createSession(parsed.data));
  });

  app.delete("/api/sessions/:id", (req, res) => {
    storage.deleteSession(Number(req.params.id));
    res.json({ ok: true });
  });

  // Aggregates
  app.get("/api/aggregates", (_req, res) => {
    res.json(storage.getAllAggregates());
  });

  app.get("/api/sessions/:id/aggregates", (req, res) => {
    res.json(storage.getAggregatesBySession(Number(req.params.id)));
  });

  app.post("/api/aggregates", (req, res) => {
    const parsed = insertAggregateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(storage.createAggregate(parsed.data));
  });

  app.delete("/api/aggregates/:id", (req, res) => {
    storage.deleteAggregate(Number(req.params.id));
    res.json({ ok: true });
  });

  return httpServer;
}
