import { NextFunction, Request, Response } from "express";
import AuthRepository from "../repositories/auth.repository";
import BaseController from "./base.controller";
import authValidationSchema from "../helpers/auth_validation_schema";
import httpStatusCodes from "http-status-codes";
import auth from "../models/auth.model";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../helpers/jwt-helper";
import createError from "http-errors";
import { escape } from "querystring";

class AuthController extends BaseController {
  constructor() {
    super(AuthRepository);
  }

  // auth specific operations
  async auth(req: Request, res: Response) {
    try {
      console.log("checking auth");
      const body = req.body;
      const result = await authValidationSchema.validateAsync(body);
      const user = await auth.findOne({ email: result.email });

      if (!user)
        return res
          .status(httpStatusCodes.NOT_FOUND)
          .send({ message: "User not found" });

      // checking if user is valid
      const isMatch = await (user as any).isValidPassword(result.password);

      if (!isMatch)
        return res
          .status(httpStatusCodes.UNAUTHORIZED)
          .send({ message: "Invalid email/password" });
      const accessToken = await signAccessToken(user.id);
      const refreshToken = await signRefreshToken(user.id);

      // for safety we set accessToken and refreshToken as httponly cookie
      // res.cookie("refreshToken", refreshToken, {
      //   maxAge: 604800000,
      //   httpOnly: true,
      //   sameSite: "lax",
      //   secure: true,
      //   domain: process.env.DOMAIN ? process.env.DOMAIN : undefined,
      // });
      res.cookie("__session", `Bearer ${accessToken}`, {
        maxAge: 604800000,
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        domain: process.env.DOMAIN ? process.env.DOMAIN : undefined,
      });
      res.status(httpStatusCodes.OK).send({
        userId: user.id,
        refreshToken: refreshToken,
        // accessToken: accessToken,
      });
    } catch (err: any) {
      if (err.isJoi === true) {
        return res
          .status(httpStatusCodes.BAD_REQUEST)
          .send({ message: "Invalid email/password" });
      }
      return res
        .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Something went wrong." });
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.get("refreshToken");
      const userIdFromClient = req.get("userId");
      if (!refreshToken || refreshToken === undefined)
        throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken, userIdFromClient);
      const newAccessToken = await signAccessToken(userId);
      // const newRefreshToken = await signRefreshToken(userId);
      // res.cookie("refreshToken", newRefreshToken, {
      //   maxAge: 604800000,
      //   httpOnly: true,
      //   sameSite: "lax",
      //   secure: true,
      //   domain: process.env.DOMAIN ? process.env.DOMAIN : undefined,
      // });
      res.cookie("__session", `Bearer ${newAccessToken}`, {
        maxAge: 604800000,
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        domain: process.env.DOMAIN ? process.env.DOMAIN : undefined,
      });
      res.status(httpStatusCodes.OK).send({ message: "refreshed" });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // res.clearCookie("refreshToken");
      res.clearCookie("__session");
      res.sendStatus(204);
      res.end();
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
