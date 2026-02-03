import "dotenv/config";
import express from "express";
import { defineConfig } from "drizzle-kit";
import { eq } from "drizzle-orm";
// The 'pool' export will only exist for WebSocket and node-postgres drivers
import { db } from "./db/index.js";
import { demoUsers } from './db/schema/index.js';

const app = express();
const PORT = 8000;

// Middleware
app.use(express.json());

// Root GET route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Classroom API" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

async function main() {
  try {
    console.log("Performing CRUD operations...");

    // CREATE: Insert a new user
    const [newUser] = await db
      .insert(demoUsers)
      .values({ name: "Admin User", email: "admin@example.com" })
      .returning();

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    console.log("✅ CREATE: New user created:", newUser);

    // READ: Select the user
    const foundUser = await db
      .select()
      .from(demoUsers)
      .where(eq(demoUsers.id, newUser.id));
    console.log("✅ READ: Found user:", foundUser[0]);

    // UPDATE: Change the user's name
    const [updatedUser] = await db
      .update(demoUsers)
      .set({ name: "Super Admin" })
      .where(eq(demoUsers.id, newUser.id))
      .returning();

    if (!updatedUser) {
      throw new Error("Failed to update user");
    }

    console.log("✅ UPDATE: User updated:", updatedUser);

    // DELETE: Remove the user
    await db.delete(demoUsers).where(eq(demoUsers.id, newUser.id));
    console.log("✅ DELETE: User deleted.");

    console.log("\nCRUD operations completed successfully.");
  } catch (error) {
    console.error("❌ Error performing CRUD operations:", error);
    process.exit(1);
  } finally {
    // Close the database connection if needed
    console.log("Database connection closed.");
  }
}

main();
