/* eslint-disable perfectionist/sort-imports */
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";

import type { AppRouteHandler } from "@/lib/types";
import db from "@/db";
import { users } from "@/db/schema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";

import type {
  register,
  login,
  getOne,
  ListUsersRoute,
  CreateUserRoute,
  PatchUserRoute,
  RemoveUserRoute
} from "./users.routes";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const register: AppRouteHandler<typeof register> = async (c) => {
  const data = c.req.valid("json");
  const hashedPassword = await hash(data.password, 10);
  const [user] = await db.insert(users).values({
    nom: data.nom,
    email: data.email,
    password: hashedPassword,
  }).returning();
  if (!user) {
    return c.json({ message: "Registration failed" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
  }
  const { password, ...userData } = user;
  return c.json(userData, HttpStatusCodes.OK);
};

export const login: AppRouteHandler<typeof login> = async (c) => {
  const data = c.req.valid("json");
  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, data.email);
    },
  });
  if (!user) {
    return c.json({ message: "Invalid credentials" }, HttpStatusCodes.UNAUTHORIZED);
  }
  const valid = await compare(data.password, user.password);
  if (!valid) {
    return c.json({ message: "Invalid credentials" }, HttpStatusCodes.UNAUTHORIZED);
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
  return c.json({ token }, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<typeof getOne> = async (c) => {
  const { id } = c.req.valid("param");
  const user = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });
  if (!user) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }
  const { password, ...userData } = user;
  return c.json(userData, HttpStatusCodes.OK);
};

export const list: AppRouteHandler<ListUsersRoute> = async (c) => {
  const usersList = await db.query.users.findMany();
  const safeUsers = usersList.map(({ password, ...u }) => u);
  return c.json(safeUsers);
};

export const create: AppRouteHandler<CreateUserRoute> = async (c) => {
  const data = c.req.valid("json");
  const hashedPassword = await hash(data.password, 10);
  const [user] = await db.insert(users).values({
    ...data,
    password: hashedPassword,
  }).returning();
  if (!user) {
    return c.json({ message: "Registration failed" }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
  }
  const { password, ...userData } = user;
  return c.json(userData, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchUserRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");
  if (Object.keys(updates).length === 0) {
    return c.json({
      success: false,
      error: {
        issues: [
          {
            code: ZOD_ERROR_CODES.INVALID_UPDATES,
            path: [],
            message: ZOD_ERROR_MESSAGES.NO_UPDATES,
          },
        ],
        name: "ZodError",
      },
    }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
  }
  if (updates.password) {
    updates.password = await hash(updates.password, 10);
  }
  const [user] = await db.update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning();
  if (!user) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }
  const { password, ...userData } = user;
  return c.json(userData, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveUserRoute> = async (c) => {
  const { id } = c.req.valid("param");
  const result = await db.delete(users)
    .where(eq(users.id, id));
  if (result.rowsAffected === 0) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }
  return c.body(null, HttpStatusCodes.NO_CONTENT);
}; 