import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  One row per paid order of a book that carries Prep Arena matches and/or is a
  pack (Book.membership.plan). It is the record of what that purchase gave:

    matches.granted   copied from Book.matches AT PURCHASE TIME (later edits to
                      the book never change what this buyer was promised)
    matches.claimedAt set when the matches were put on the buyer's arena account.
                      That happens the moment they have an arena profile
                      (sign-up) - or immediately if they already have one.
    plan / lifetime   pack buyers get new-book emails; lifetime buyers get the
                      PDF of every future book too.
*/
const membershipSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    name: { type: String, default: "", trim: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },

    orderId: { type: String, required: true, unique: true },
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    bookTitle: { type: String, default: "" },
    paidAmount: { type: Number, default: 0 },
    activatedAt: { type: Date, default: Date.now },

    plan: { type: String, enum: ["none", "all_current", "lifetime"], default: "none", index: true },
    lifetime: { type: Boolean, default: false },

    matches: {
      granted: { type: Number, default: 0, min: 0 },
      claimedAt: { type: Date, default: null },
      claimedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    },

    // Books we already told this member about (so a retry never double-sends).
    notifiedBookIds: { type: [Schema.Types.ObjectId], default: [] },

    welcomeMailSentAt: { type: Date, default: null },

    /*
      Admin can suspend a membership. While ANY of a person's memberships is suspended:
      no Prep Arena access (their profile is suspended, unused matches stay on the entry),
      no Books tab / suggestions, no new-book emails, and waiting matches are not added.
      Unsuspending puts everything back exactly as it was.
    */
    status: { type: String, enum: ["active", "suspended"], default: "active", index: true },
    suspendedAt: { type: Date, default: null },
    suspendedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    suspendReason: { type: String, default: "", maxlength: 500 },
    // true when THIS suspension is what suspended their arena profile (so unsuspend knows to lift it).
    arenaSuspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

membershipSchema.index({ email: 1, plan: 1 });
membershipSchema.index({ "matches.granted": 1, "matches.claimedAt": 1, email: 1 });

export default mongoose.models.Membership || mongoose.model("Membership", membershipSchema);
