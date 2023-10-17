import mongoose from "mongoose";

const Schema = mongoose.Schema;
const objectId = mongoose.Schema.Types.ObjectId;

const readingSchema = new Schema(
  {
    _id: { type: objectId, auto: true },
    device: { type: String },
    // t: { type: String },
    t: { type: String },
    w: { type: Number },
    h: { type: String },
    p1: { type: Number },
    p25: { type: Number },
    p10: { type: Number },
  },
  { versionKey: false, timestamps: true }
);

// readingSchema.pre("save", function (next) {
//   const dateString = this.t; // Assuming your date field is named "yourDateField"

//   if (typeof dateString === "string") {
//     const parts = (dateString as any).split(",");
//     const dateParts = parts[0].split("/");
//     const timeParts = parts[1].split(":");

//     const day = parseInt(dateParts[0]);
//     const month = parseInt(dateParts[1]) - 1;
//     const year = 2000 + parseInt(dateParts[2]);
//     const hours = parseInt(timeParts[0]);
//     const minutes = parseInt(timeParts[1]);
//     const seconds = parseInt(timeParts[2]);

//     const jsDate = new Date(year, month, day, hours, minutes, seconds);
//     this.t = jsDate;
//   }

//   next();
// });

const reading = mongoose.model("readings", readingSchema);
export default reading;
