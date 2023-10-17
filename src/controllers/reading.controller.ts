import { NextFunction, Request, Response } from "express";
import auth from "../models/auth.model";
import ReadingRepository from "../repositories/reading.repository";
import BaseController from "./base.controller";
import XLSX from "xlsx";
import multer from "multer";
import reading from "../models/reading.model";
import httpStatusCodes from "http-status-codes";
import moment from "moment";

class ReadingController extends BaseController {
  constructor() {
    super(ReadingRepository);
  }

  async getAllData(req: Request, res: Response) {
    console.log("getting all data");
    const params_devices = req.query.devices;

    const devices = (<string>params_devices)?.split(",");

    console.log(devices);

    await reading
      .find({ device: { $in: devices } })
      .then((docs: any) => {
        return res.status(201).send({ data: docs });
      })
      .catch((err: any) => {
        return res
          .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
          .send({ message: "Internal Server Error", error: err });
      });
  }

  async getReadings(req: Request, res: Response) {
    console.log("getting readings");
    // const params_pms = req.query.pms;
    const params_devices = req.query.devices;
    const pm = req.query.pm;

    const startTime = req.query.starttime
      ? moment(
          req.query.starttime as string,
          "YY/MM/DD,HH:mm:ss",
          "YYYY-MM-ddTHH:mm:ss"
        )
      : null;

    console.log(startTime);

    const endTime = req.query.endtime
      ? moment(
          req.query.endtime as string,
          "YY/MM/DD,HH:mm:ss",
          "YYYY-MM-ddTHH:mm:ss"
        )
      : null;

    console.log(endTime);

    // const pms = (<string>params_pms)?.split(",");
    const devices = (<string>params_devices)?.split(",");

    console.log(devices);

    // const records = await reading.find({ device: { $in: devices } });

    var readData;

    if (startTime && endTime) {
      console.log("time range given");
      readData = await reading
        .find({
          $and: [
            {
              t: {
                $gte: startTime,
                $lte: endTime,
              },
            },
            { device: { $in: devices } },
          ],
        })
        .select(`-_id device t ${pm}`)
        .then((docs: any) => {
          console.log(docs);
          return res.status(201).send({ data: docs });
        })
        .catch((err: any) => {
          return res
            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
            .send({ message: "Internal Server Error", error: err });
        });
    } else {
      console.log("no time range");
      await reading
        .find({ device: { $in: devices } })
        .select(`-_id device t ${pm}`)
        .then((docs: any) => {
          return res.status(201).send({ data: docs });
        })
        .catch((err: any) => {
          return res
            .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
            .send({ message: "Internal Server Error", error: err });
        });
    }
  }
}

export default ReadingController;
