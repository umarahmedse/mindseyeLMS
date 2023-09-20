import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
const emailRegexPattern: RegExp =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export interface InterfaceUser extends Document {
  name: string;
  email: string;
  password: string;
  // passwordConfirm: string | undefined;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  signAccessToken: () => string;
  signRefreshToken: () => string;
  comparePassword: (password: string) => Promise<boolean>;
}
const userSchema: Schema<InterfaceUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter your name"],
    },
    email: {
      type: String,
      required: [true, "please enter your email"],
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "please enter a valid email",
      },
      unique: true,
    },
    password: {
      type: String,
      required: [true, "please enter a password"],
      minlength: [6, "password must be 6 characters long"],
      select: false,
    },
    // passwordConfirm: {
    //   type: String,
    //   required: [true, "please confirm your password"],
    //   minlength: [6, "confirmed password must be 6 characters long"],
    //   select: false,
    // },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: String,
      },
    ],
  },
  { timestamps: true }
);

//Hash Password Functionality
userSchema.pre<InterfaceUser>("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 10);
  // this.passwordConfirm = undefined;
  next();
});
//sign access token
userSchema.methods.signAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "");
};
userSchema.methods.signRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "");
};
//Compare Password Functionality
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel: Model<InterfaceUser> = mongoose.model("User", userSchema);
export default userModel;
