import { Document, Schema, model } from "mongoose";
import { ApplicationsStatus } from "../enums/globals.enums";

export interface IGlobalsModel extends Document {
  applicationsStatus: ApplicationsStatus;
  applicationsPublic: boolean;
  hackingTimeStart: Date;
  hackingTimeEnd: Date;
  emailsSent: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema(
  {
    applicationsStatus: {
      type: String,
      enum: Object.values(ApplicationsStatus),
      default: ApplicationsStatus.OPEN,
    },
    applicationsPublic: { type: Boolean, default: false },
    hackingTimeStart: {
      type: Date,
      default: new Date("September 18, 2021 12:00:00 EDT"),
    },
    hackingTimeEnd: {
      type: Date,
      default: new Date("September 19, 2021 12:00:00 EDT"),
    },
    emailsSent: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Globals = model<IGlobalsModel>("Globals", schema, "globals");
