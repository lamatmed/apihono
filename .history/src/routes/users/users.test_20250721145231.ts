/* eslint-disable unused-imports/no-unused-vars */
import { testClient } from "hono/testing";
import { execSync } from "node:child_process";
import fs from "node:fs";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { afterAll, beforeAll, describe, expect, expectTypeOf, it } from "vitest";
import { ZodIssueCode } from "zod";

import env from "@/env";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/lib/constants";
import { createTestApp } from "@/lib/create-app";

import router from "./users.index";

if (env.NODE_ENV !== "test") {
  throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createTestApp(router));

describe("users routes", () => {
  beforeAll(async () => {
    execSync("pnpm drizzle-kit push");
  });

  afterAll(async () => {
    fs.rmSync("test.db", { force: true });
  });

  const nom = "Jean Test";
  const email = "jean@example.com";
  const password = "password123";
  let userId: number;
  let token: string;

  it("post /users/register crée un utilisateur", async () => {
    const response = await client.users.register.$post({
      json: { nom, email, password },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.nom).toBe(nom);
      expect(json.email).toBe(email);
      userId = json.id;
    }
  });

  it("post /users/login connecte l'utilisateur et retourne un token", async () => {
    const response = await client.users.login.$post({
      json: { email, password },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.token).toBeDefined();
      token = json.token;
    }
  });

  it("get /users/{id} retourne l'utilisateur sans mot de passe", async () => {
    const response = await client.users[":id"].$get({
      param: { id: userId },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.nom).toBe(nom);
      expect(json.email).toBe(email);
      expect(json.password).toBeUndefined();
    }
  });

  it("get /users liste tous les utilisateurs", async () => {
    const response = await client.users.$get();
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expectTypeOf(json).toBeArray();
      expect(json.length).toBeGreaterThan(0);
      expect(json[0].password).toBeUndefined();
    }
  });

  it("post /users crée un utilisateur (CRUD)", async () => {
    const response = await client.users.$post({
      json: { nom: "CRUD User", email: "crud@example.com", password: "crudpass" },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.nom).toBe("CRUD User");
      expect(json.email).toBe("crud@example.com");
    }
  });

  it("patch /users/{id} modifie un utilisateur", async () => {
    const response = await client.users[":id"].$patch({
      param: { id: userId },
      json: { nom: "Jean Modifié" },
    });
    expect(response.status).toBe(200);
    if (response.status === 200) {
      const json = await response.json();
      expect(json.nom).toBe("Jean Modifié");
    }
  });

  it("delete /users/{id} supprime un utilisateur", async () => {
    const response = await client.users[":id"].$delete({
      param: { id: userId },
    });
    expect(response.status).toBe(204);
  });

  it("get /users/{id} retourne 404 si utilisateur non trouvé", async () => {
    const response = await client.users[":id"].$get({
      param: { id: 9999 },
    });
    expect(response.status).toBe(404);
    if (response.status === 404) {
      const json = await response.json();
      expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
    }
  });

  it("post /users/register valide le body (erreur)", async () => {
    const response = await client.users.register.$post({
     
      json: { email },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("nom");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });

  it("post /users/login retourne 401 si mauvais mot de passe", async () => {
    const response = await client.users.login.$post({
      json: { email, password: "wrongpass" },
    });
    expect(response.status).toBe(401);
    if (response.status === 401) {
      const json = await response.json();
      expect(json.message).toBe("Invalid credentials");
    }
  });
}); 