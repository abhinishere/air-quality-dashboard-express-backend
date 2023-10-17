import JWT from "jsonwebtoken";
import createError from "http-errors";
import { NextFunction, Request, Response } from "express";
import { IGetTokenAuthRequest } from "./request-definition";
// import client from "../helpers/init_redis.js";
// const client = require("../helpers/init_redis.js");

function signAccessToken(userId: string) {
  return new Promise((resolve, reject) => {
    const payload = {};
    const secret = process.env.REACT_APP_ACCESS_TOKEN_SECRET;
    const options = {
      expiresIn: "15s",
      issuer: "example.com",
      audience: userId.toString(),
    };
    JWT.sign(payload, secret!, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
        return;
      }
      resolve(token);
    });
  });
}

function verifyAccessToken(
  req: IGetTokenAuthRequest,
  res: Response,
  next: NextFunction
) {
  console.log("verifying access token");
  try {
    if (!req.cookies.__session || req.cookies.__session === undefined)
      return next(createError.Unauthorized);
    const tokenPlusBearer = req.cookies.__session;

    const tempToken = tokenPlusBearer.split(" ");
    const token = tempToken[1];

    if (!token) return next(createError.Unauthorized);
    JWT.verify(
      token,
      process.env.REACT_APP_ACCESS_TOKEN_SECRET!,
      (err: any, payload: any) => {
        if (err) {
          const message =
            err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
          console.log(`error message is ${err.name}`);
          return next(createError.Unauthorized(message));
        }
        console.log("verification successful; next");
        req.payload = payload;
        next();
      }
    );
  } catch (error: any) {
    return next(createError.InternalServerError(error.message));
  }
}

function signRefreshToken(userId: string) {
  return new Promise((resolve, reject) => {
    const payload = {};
    const secret = process.env.REACT_APP_REFRESH_TOKEN_SECRET;
    const options = {
      expiresIn: "1y",
      issuer: "example.com",
      audience: userId.toString(),
    };
    JWT.sign(payload, secret!, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
        return;
      }
      // TOKEN
      // client.SET(
      //   userId,
      //   token,
      //   { EX: 365 * 24 * 60 * 60 },
      //   (err: any, reply: any) => {
      //     if (err) {
      //       console.log(err.message);
      //       reject(createError.InternalServerError());
      //       return;
      //     }
      //   }
      // );
      resolve(token);
    });
  });
}
function verifyRefreshToken(refreshToken: any, userIdFromClient: any) {
  return new Promise<string>((resolve, reject) => {
    JWT.verify(
      refreshToken,
      process.env.REACT_APP_REFRESH_TOKEN_SECRET!,
      async (err: any, payload: any) => {
        if (err) {
          console.log(err);
          return reject(createError.Unauthorized());
        }
        const userId = payload?.aud;
        if (!userIdFromClient) return reject(createError.InternalServerError());
        if (userId === userIdFromClient) {
          console.log("verified user id");
          return resolve(userId);
        }
        // GET TOKEN
        // const result = await client.GET(userId);
        // if (!result) return reject(createError.InternalServerError());
        // if (refreshToken === result) return resolve(userId);
        reject(createError.Unauthorized());
      }
    );
  });
}

export {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
