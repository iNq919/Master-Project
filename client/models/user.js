import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, match: /.+\@.+\..+/ },
  password: { type: String, required: true, minlength: 6 },
  verificationCode: { type: String },
  isVerified: { type: Boolean, default: false },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
