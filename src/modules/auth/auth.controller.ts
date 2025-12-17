import { Request, Response } from "express";
import { AuthService } from "./auth.service";

const signUp = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.signUp(req.body);
    res
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const signIn = async (req: Request, res: Response) => {
  try {
    const result = await AuthService.signIn(req.body);
    res
      .status(200)
      .json({ success: true, message: "Login successful", data: result });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const AuthController = { signUp, signIn };
