import argon2 from "argon2";
import pool from "../db/pool.js";
import { signToken } from "../utils/jwt.js";

export async function register(username, password) {
  const trimmed = username.trim();

  if (trimmed.length < 3 || trimmed.length > 20) {
    throw Object.assign(new Error("Username must be 3–20 characters."), { status: 400 });
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    throw Object.assign(new Error("Username may only contain letters, numbers, and underscores."), { status: 400 });
  }
  if (password.length < 6) {
    throw Object.assign(new Error("Password must be at least 6 characters."), { status: 400 });
  }

  const hash = await argon2.hash(password, { type: argon2.argon2id });

  let user;
  try {
    const result = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at",
      [trimmed, hash]
    );
    user = result.rows[0];
  } catch (err) {
    if (err.code === "23505") {
      throw Object.assign(new Error("That username is already taken."), { status: 409 });
    }
    throw err;
  }

  const token = signToken({ userId: user.id, username: user.username });
  return { token, user: { id: user.id, username: user.username, createdAt: user.created_at } };
}

export async function login(username, password) {
  const trimmed = username.trim();
  const result = await pool.query(
    "SELECT id, username, password_hash, created_at FROM users WHERE username = $1",
    [trimmed]
  );

  const user = result.rows[0];
  if (!user) {
    throw Object.assign(new Error("Invalid username or password."), { status: 401 });
  }

  const valid = await argon2.verify(user.password_hash, password);
  if (!valid) {
    throw Object.assign(new Error("Invalid username or password."), { status: 401 });
  }

  const token = signToken({ userId: user.id, username: user.username });
  return { token, user: { id: user.id, username: user.username, createdAt: user.created_at } };
}

export async function getProfile(userId) {
  const result = await pool.query(
    "SELECT id, username, created_at FROM users WHERE id = $1",
    [userId]
  );
  const user = result.rows[0];
  if (!user) throw Object.assign(new Error("User not found."), { status: 404 });
  return { id: user.id, username: user.username, createdAt: user.created_at };
}
