import { authRoutes } from "./modules/auth/auth.routes";
import express, { Request, response, Response } from "express";
import config from "./config";
import initDB from "./config/db";
import { vehicleRoutes } from "./modules/vehicle/vehicle.routes";

const app = express();
// Parser
app.use(express.json());
app.use(express.urlencoded());

// Initializing Database
initDB();

// Auth
app.use("/api/v1/auth", authRoutes);

// Vehicles
app.use("/api/v1/vehicles", vehicleRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route Not found",
    path: req.path,
  });
});

app.listen(config.port, () => {
  console.log(`Example app listening on port ${config.port}`);
});
