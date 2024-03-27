import mongoose, { Schema } from "mongoose";

const likeSchema = Schema(
  {
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reference: {
      type: Schema.Types.ObjectId,
      refPath: "model_type",
    },
    model_type: {
      type: String,
      enum: ["Video", "Tweet", "Comment"],
      required: true,
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);

//https://mongoosejs.com/docs/populate.html#dynamic-refpath
