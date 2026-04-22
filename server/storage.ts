import { db } from "./db";
import { sessions, aggregates, type Session, type Aggregate, type InsertSession, type InsertAggregate } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getSessions(): Session[];
  createSession(data: InsertSession): Session;
  deleteSession(id: number): void;
  getAggregatesBySession(sessionId: number): Aggregate[];
  getAllAggregates(): Aggregate[];
  createAggregate(data: InsertAggregate): Aggregate;
  deleteAggregate(id: number): void;
}

export class DatabaseStorage implements IStorage {
  getSessions(): Session[] {
    return db.select().from(sessions).all();
  }

  createSession(data: InsertSession): Session {
    return db.insert(sessions).values(data).returning().get();
  }

  deleteSession(id: number): void {
    db.delete(aggregates).where(eq(aggregates.sessionId, id)).run();
    db.delete(sessions).where(eq(sessions.id, id)).run();
  }

  getAggregatesBySession(sessionId: number): Aggregate[] {
    return db.select().from(aggregates).where(eq(aggregates.sessionId, sessionId)).all();
  }

  getAllAggregates(): Aggregate[] {
    return db.select().from(aggregates).all();
  }

  createAggregate(data: InsertAggregate): Aggregate {
    return db.insert(aggregates).values(data).returning().get();
  }

  deleteAggregate(id: number): void {
    db.delete(aggregates).where(eq(aggregates.id, id)).run();
  }
}

export const storage = new DatabaseStorage();
