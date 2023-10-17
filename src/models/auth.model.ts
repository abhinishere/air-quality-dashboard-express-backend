import mongoose from "mongoose";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;
const objectId = mongoose.Schema.Types.ObjectId;

const authSchema = new Schema(
  {
    _id: { type: objectId, auto: true },
    username: { type: String, required: false },
    email: { type: String, required: true, lowercase: true, unique: true },
    password: {
      type: String,
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

// pre save middleware to hash password
authSchema.pre("save", async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error: any) {
    next(error);
  }
});

authSchema.methods.isValidPassword = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

const auth = mongoose.model("auths", authSchema);
export default auth;
