import("./config/db.js");
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { verifyAccessToken } from "./helpers/jwt-helper.js";
import createError from "http-errors";
import readingRouter from "./routes/reading.routes.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "path";

const origin = process.env.ORIGIN || "*";

const app = express();

// exposing static files
app.use(express.static("/uploads"));

// setting up cors
app.use(
  cors({
    origin: origin,
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);

app.use(express.json());
app.use(cookieParser());

// for form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// api routes
// reading route protected
app.use("/api/reading", verifyAccessToken as any, readingRouter);
app.use("/api/auth", authRouter);

app.use(async (req, res, next) => {
  next(createError.NotFound());
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err,
    },
  });
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  // console.log(`server is running at port ${port}`);
});
