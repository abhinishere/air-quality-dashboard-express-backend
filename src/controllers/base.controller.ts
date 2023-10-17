import httpStatusCodes from "http-status-codes";
import { Request, Response } from "express";
import multer from "multer";
import XLSX from "xlsx";
import moment from "moment";

const timeRegex = /(\d{2}:\d{2}:\d{2})/;
function test(dateString: string) {
  return convertToDate(dateString);
}

function convertTimeToTimeObject(timeString: string) {
  const match = timeRegex.exec(timeString);
  if (match) {
    const [_, hours, minutes, seconds] = match;
    const timeObject = new Date();
    timeObject.setHours(Number(hours), Number(minutes), Number(seconds)); // Convert to numbers
    return timeObject;
  }
  return null;
}

function convertDateTime(timeString: string) {}

function convertToDate(dateString: string) {
  const parts = dateString.split(",");
  const dateParts = parts[0].split("/");
  const timeParts = parts[1].split(":");
  const day = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1; // Month is 0-based in JavaScript
  const year = 2000 + parseInt(dateParts[2]); // Assuming years between 2000 and 2099
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  const seconds = parseInt(timeParts[2]);
  return new Date(year, month, day, hours, minutes, seconds);
}

class BaseController {
  repo: any;
  constructor(repoClass: any) {
    this.repo = new repoClass();
  }

  // common response methods
  ok(res: Response, data: any) {
    if (!!data) {
      res.status(httpStatusCodes.OK).send(data);
    } else {
      return res.status(httpStatusCodes.OK).send({ message: "Ok" });
    }
  }

  async created(res: Response, data: any) {
    return res
      .status(httpStatusCodes.CREATED)
      .send({ message: "Created", data: data });
  }

  unauthorized(res: Response, message: any) {
    return res
      .status(httpStatusCodes.UNAUTHORIZED)
      .send({ message: "Unauthorized" });
  }

  forbidden(res: Response, message: any) {
    return res.status(httpStatusCodes.FORBIDDEN).send({ message: "Forbidden" });
  }

  notFound(res: Response, message: any) {
    return res.status(httpStatusCodes.NOT_FOUND).send({ message: "Not Found" });
  }

  conflict(res: Response, message: any) {
    return res.status(httpStatusCodes.CONFLICT).send({ message: "Conflict" });
  }

  internalServerError(res: Response, error: any) {
    return res
      .status(httpStatusCodes.INTERNAL_SERVER_ERROR)
      .send({ message: "Internal Server Error" });
  }

  //common db operations
  getAll = (req: Request, res: Response) => {
    this.repo
      .findAll()
      .then((docs: any) => {
        return this.ok(res, docs);
      })
      .catch((err: any) => {
        return this.internalServerError(res, err);
      });
  };

  getById = (req: Request, res: Response) => {
    let id = req.params.id;
    this.repo
      .findById(id)
      .then((doc: any) => {
        return this.ok(res, doc);
      })
      .catch((err: any) => {
        return this.internalServerError(res, err);
      });
  };

  // for adding new readings & users
  add = (req: Request, res: Response) => {
    //if the incoming req has a readings file
    console.log("inside add");
    var body;
    if (req.file?.path) {
      console.log("file-based; extract data from excel file");
      let path = req.file!.path;
      var workbook = XLSX.readFile(path);
      var sheet_name_list = workbook.SheetNames;
      const extractedData = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheet_name_list[0]]
      );
      // Iterate through the array of objects and convert date fields
      console.log("converting data");
      body = extractedData.map((obj: any) => ({
        ...obj,
        t: moment((obj as any).t, "YY/MM/DD,HH:mm:ss", "YYYY-MM-ddTHH:mm:ss"),
      }));
      // const body = extractedData.forEach((item: any) => {
      //   item.t = moment(item.t, "YY/MM/DD,HH:mm:ss", "YYYY-MM-ddTHH:mm:ss");
      // });
      console.log("converting data completed");
      // if (body.length === 0) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "xml sheet has no data",
      //   });
      // }
    } else {
      console.log("not a file; directly upload body");
      body = req.body;
    }

    this.repo
      .create(body)
      .then((doc: any) => {
        return this.created(res, doc);
      })
      .catch((err: any) => {
        console.log(err.message);
        return this.internalServerError(res, err);
      });
  };
  update(req: Request, res: Response) {
    // let id = req.params.id;
    const body = req.body;
    this.repo
      .update(body)
      .then((doc: any) => {
        return this.ok(res, doc);
      })
      .catch((err: any) => {
        return this.internalServerError(res, err);
      });
  }
  deleteById(req: Request, res: Response) {
    let id = req.params.id;
    this.repo
      .deleteById(id)
      .then((doc: any) => {
        return this.ok(res, doc);
      })
      .catch((err: any) => {
        return this.internalServerError(res, err);
      });
  }
}

export default BaseController;
