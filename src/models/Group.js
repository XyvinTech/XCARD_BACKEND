import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    groupAdmin: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    groupPicture: Object,
  },
  { timestamps: true }
);

export default mongoose.model("Group", GroupSchema);
