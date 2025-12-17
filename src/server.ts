import { AuthRoutes } from "./modules/auth/auth.routes";
import express, { Request, response, Response } from "express";
import config from "./config";
import initDB from "./config/db";

const app = express();
// Parser
app.use(express.json());
app.use(express.urlencoded());

// Initializing Database
initDB();

// Auth
app.use("/auth", AuthRoutes);

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
