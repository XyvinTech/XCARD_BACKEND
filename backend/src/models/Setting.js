import mongoose from "mongoose";
const SettingSchema = new mongoose.Schema(
  {
    application: Object,
  },
  { timestamps: true }
);

export default mongoose.model("Setting", SettingSchema);
