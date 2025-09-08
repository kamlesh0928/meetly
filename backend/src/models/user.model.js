import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  meetings: {
    type: [Object],
    default: [],
  },
});

const User = mongoose.model("User", userSchema);

export { User };
