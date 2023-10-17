import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
export interface IGetTokenAuthRequest extends Request {
  payload: string | JwtPayload | undefined;
}
