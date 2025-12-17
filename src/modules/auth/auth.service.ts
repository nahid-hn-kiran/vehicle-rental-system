import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db";

const signUp = async (payload: Record<string, any>) => {
  const { name, email, password, phone, role } = payload;

  const check = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  if (check.rows.length > 0) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 12);
  const query = `
    INSERT INTO users (name, email, password, phone, role) 
    VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role`;

  const result = await pool.query(query, [
    name,
    email,
    hashed,
    phone,
    role || "customer",
  ]);
  return result.rows[0];
};

const signIn = async (payload: Record<string, any>) => {
  const { email, password } = payload;
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  delete user.password;
  return { token, user };
};

export const AuthService = { signUp, signIn };
