import express from "express";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.get("/", auth("admin"), userController.getAllUsers);

router.get("/:userId", auth("admin", "customer"), userController.getUserById);

router.put("/:userId", auth("admin", "customer"), userController.updateUser);

router.delete("/:userId", auth("admin"), userController.deleteUser);

export const userRoutes = router;
