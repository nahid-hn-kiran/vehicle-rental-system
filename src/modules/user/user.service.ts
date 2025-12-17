import { pool } from "../../config/db";

const getAllUsers = async () => {
  const result = await pool.query(
    "SELECT id, name, email, phone, role FROM users"
  );
  return result.rows;
};

const getUserById = async (id: string) => {
  const result = await pool.query(
    "SELECT id, name, email, phone, role FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

const updateUser = async (id: string, payload: any) => {
  const { name, email, phone, role } = payload;

  const currentUser = await pool.query("SELECT * FROM users WHERE id = $1", [
    id,
  ]);

  if (currentUser.rows.length === 0) {
    throw new Error("User not found");
  }

  const existingData = currentUser.rows[0];

  const updatedName = name || existingData.name;
  const updatedEmail = email || existingData.email;
  const updatedPhone = phone || existingData.phone;
  const updatedRole = role || existingData.role;

  const result = await pool.query(
    `UPDATE users 
     SET name=$1, email=$2, phone=$3, role=$4 
     WHERE id=$5 
     RETURNING id, name, email, phone, role`, // Explicitly excluding password/timestamps
    [updatedName, updatedEmail, updatedPhone, updatedRole, id]
  );

  return result.rows[0];
};

const deleteUser = async (id: string) => {
  const activeBookings = await pool.query(
    `SELECT * FROM bookings WHERE customer_id = $1 AND status = 'active'`,
    [id]
  );

  if (activeBookings.rows.length > 0) {
    throw new Error("Cannot delete user with active bookings");
  }

  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING id",
    [id]
  );

  if (result.rowCount === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
};

export const userService = { getAllUsers, getUserById, updateUser, deleteUser };
