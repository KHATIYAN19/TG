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

    // Admin kill-switches. When false the server refuses the action AND stops
    // sending any related data (fee %, refund amounts) to members.
    //   cancelRefundEnabled     – member "cancel entry & refund" and the admin "initiate refund"
    //   accountDeletionEnabled  – member "delete my account"
    // The fee % stored on each paid entry is never changed, so re-enabling later
    // refunds each member by the % that applied when THEY paid.
    cancelRefundEnabled: { type: Boolean, default: true },
    accountDeletionEnabled: { type: Boolean, default: true },

    // Affiliate sales switch. When false, new checkouts earn no affiliate commission.
    affiliateEnabled: { type: Boolean, default: true },

    // Limited-time offer banner (text + optional countdown) shown under the pay button.
    offerEnabled: { type: Boolean, default: false },
    offerEndsAt: { type: Date, default: null },
    offerText: { type: String, trim: true, maxlength: 300, default: "" },

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
  cancelRefundEnabled: true,
  accountDeletionEnabled: true,
  affiliateEnabled: true,
  offerEnabled: false,
  offerEndsAt: null,
  offerText: "",
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
    // offerEndsAt may legitimately be null ("no end date").
    if (key === "offerEndsAt") continue;
    if (value[key] === undefined || value[key] === null) value[key] = ARENA_SETTING_DEFAULTS[key];
  }

  cache = { value, at: Date.now() };
  return value;
};

/*
  What members may see of the offer. "active" is decided on the SERVER clock:
  switched on, has text, and (no end date or the end date is still in the future).
*/
export const publicOffer = (s) => {
  const endsAt = s.offerEndsAt ? new Date(s.offerEndsAt) : null;
  const active =
    Boolean(s.offerEnabled) &&
    Boolean(String(s.offerText || "").trim() || endsAt) &&
    (!endsAt || endsAt.getTime() > Date.now());
  return {
    active,
    text: active ? String(s.offerText || "") : "",
    endsAt: active && endsAt ? endsAt.toISOString() : null,
    serverNow: new Date().toISOString(),
  };
};

/* Server-side guards: throw the same shape the controllers use. */
export const isCancelRefundEnabled = (s) => s.cancelRefundEnabled !== false;
export const isAccountDeletionEnabled = (s) => s.accountDeletionEnabled !== false;

export const invalidateArenaSettingsCache = () => {
  cache = { value: null, at: 0 };
};

export default ArenaSettings;
