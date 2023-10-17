import express, { Request, Response } from "express";
import ReadingController from "../controllers/reading.controller";
import multer from "multer";
import path from "path";
import fs from "fs-extra";

const uploadsDir = "/uploads";

// storage configs for multer; where to store excel files
var storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    await fs.ensureDir(uploadsDir).then(() => {
      cb(null, uploadsDir);
    });
    // cb(null, path.join(__dirname, "/uploads/"));
  },
  filename: async function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = "/" + file.fieldname + "-" + uniqueSuffix + ".xlsx";
    console.log(fileName);
    await fs.ensureFile(uploadsDir + fileName).then(() => {
      cb(null, fileName);
    });
  },
});

const upload = multer({ storage: storage }).single("file");

const readingRouter = express.Router();
const readingController = new ReadingController();

// route to get all data based on given devices
readingRouter.get("/getalldata", readingController.getAllData);

// route to get specific pm readings based on given devices
readingRouter.get("/getreadings", readingController.getReadings);

// uploading excel file
readingRouter.post(
  "/upload",
  function (req, res, next) {
    upload(req, res, function (err) {
      if (err) {
        // if you have a Multer-based error which has to do with the uploading process
        console.log("File upload error multer-based");
        console.log(err);
        return res.status(500);
      }
      // upload successful
      console.log("file uploaded with multer successfully");
      next();
    });
  },
  // if multer middleware works, proceed to DB additions
  readingController.add
);

export default readingRouter;
