import mongoose from "mongoose";

const mongodbUrl = process.env.REACT_APP_MONGODB_URL;

mongoose.connect(mongodbUrl!);

mongoose.connection.on("error", (err) => {
  console.log(err);
});

mongoose.connection.on("connected", (res) => {
  console.log("connected");
});
