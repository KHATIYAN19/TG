import mongoose from "mongoose";

const { Schema } = mongoose;

/* Single document (key = "main"): everything the admin can tune for Memory Pages. */
const memorySettingsSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true, immutable: true },

    /* price per page in RUPEES (0 = free). Converted with amountToPaise() at checkout. */
    price: { type: Number, default: 99, min: 0, max: 1000000 },

    maxPhotos: { type: Number, default: 10, min: 0, max: 500 },
    maxVideos: { type: Number, default: 3, min: 0, max: 100 },
    maxPhotoMb: { type: Number, default: 10, min: 0.1, max: 25 },
    maxVideoMb: { type: Number, default: 100, min: 0.1, max: 500 },
    /* a voice message on the page: recorded in the browser (up to 2 minutes) or uploaded. Only the size is set here. */
    maxAudioMb: { type: Number, default: 10, min: 0.1, max: 25 },
    /* longest video and voice message, in seconds (checked in the browser and again when the file is attached) */
    maxVideoSec: { type: Number, default: 60, min: 1, max: 3600 },
    maxAudioSec: { type: Number, default: 120, min: 1, max: 1800 },
    maxMessageChars: { type: Number, default: 2000, min: 10, max: 10000 },

    /* payment gateways the admin switched on (ids from services/memory/payments). Empty = every configured gateway. */
    enabledGateways: { type: [String], default: [] },
    defaultGateway: { type: String, default: "" },

    /* how many days a page stays online from the day it is created (then it is deleted). Changing it affects NEW pages. */
    pageLifetimeDays: { type: Number, default: 30, min: 1, max: 3650 },

    /* "email this page to someone" on the create form: on/off, and a cap per user per day so it can't be used to spam */
    emailEnabled: { type: Boolean, default: true },
    maxEmailsPerUserPerDay: { type: Number, default: 10, min: 1, max: 200 },

    /* master switch: false stops new pages / purchases */
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.MemorySettings ||
  mongoose.model("MemorySettings", memorySettingsSchema);
