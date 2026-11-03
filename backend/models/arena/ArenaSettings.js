import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  Singleton configuration document for the Prep Buddy Arena.
  All money values are stored in paise.
*/
const settingsSchema = new Schema(
  {
    key: { type: String, default: "global", unique: true, immutable: true },

    enabled: { type: Boolean, default: true },

    // One-time entry fee (paise). Default ₹299.
    entryPricePaise: { type: Number, default: 29900, min: 0, max: 5000000 },

    // Fee kept when a member cancels BEFORE being matched.
    cancellationFeePercent: { type: Number, default: 10, min: 0, max: 100 },

    // How many partnerships (one after another, never at the same time)
    // a single paid entry includes. Applies to NEW purchases only.
    matchesPerEntry: { type: Number, default: 1, min: 1, max: 5 },

    maxOutgoingRequests: { type: Number, default: 10, min: 1, max: 100 },
    requestExpiryDays: { type: Number, default: 14, min: 1, max: 90 },

    // A matched pair may end the partnership only after this many days.
    minMatchDaysBeforeEnd: { type: Number, default: 0, min: 0, max: 90 },

    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

    // Bounded audit trail of changes (newest last).
    history: [
      {
        _id: false,
        at: { type: Date, default: Date.now },
        by: { type: Schema.Types.ObjectId, ref: "User" },
        changes: { type: Schema.Types.Mixed },
      },
    ],
  },
  { timestamps: true }
);

/*
  Defaults for every setting. Applied when READING (lean documents don't get
  schema defaults) so a settings record saved by an older version, that lacks a
  newer setting, can never produce undefined / NaN anywhere in the app.
*/
export const ARENA_SETTING_DEFAULTS = {
  enabled: true,
  entryPricePaise: 29900,
  cancellationFeePercent: 10,
  matchesPerEntry: 1,
  maxOutgoingRequests: 10,
  requestExpiryDays: 14,
  minMatchDaysBeforeEnd: 0,
};

const ArenaSettings =
  mongoose.models.ArenaSettings ||
  mongoose.model("ArenaSettings", settingsSchema);

let cache = { value: null, at: 0 };
const TTL_MS = 15_000;

export const getArenaSettings = async ({ fresh = false } = {}) => {
  if (!fresh && cache.value && Date.now() - cache.at < TTL_MS) {
    return cache.value;
  }

  const doc = await ArenaSettings.findOneAndUpdate(
    { key: "global" },
    { $setOnInsert: { key: "global" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  const value = { ...ARENA_SETTING_DEFAULTS, ...doc };
  for (const key of Object.keys(ARENA_SETTING_DEFAULTS)) {
    if (value[key] === undefined || value[key] === null) value[key] = ARENA_SETTING_DEFAULTS[key];
  }

  cache = { value, at: Date.now() };
  return value;
};

export const invalidateArenaSettingsCache = () => {
  cache = { value: null, at: 0 };
};

export default ArenaSettings;
