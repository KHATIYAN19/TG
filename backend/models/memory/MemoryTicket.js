import mongoose from "mongoose";

const { Schema } = mongoose;

/* One message in a ticket. `note: true` is an admin-only internal note the owner never sees. */
const messageSchema = new Schema(
  {
    from: { type: String, enum: ["user", "admin"], required: true },
    authorName: { type: String, trim: true, maxlength: 80, default: "" },
    text: { type: String, required: true, trim: true, maxlength: 5000 },
    note: { type: Boolean, default: false },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

/* A help and support ticket raised by a Memories user. */
const memoryTicketSchema = new Schema(
  {
    ticketNo: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, enum: ["payment", "page", "login", "refund", "bug", "feature", "other"], default: "other" },
    priority: { type: String, enum: ["low", "normal", "high", "urgent"], default: "normal" },
    // open = waiting for us, answered = we replied (waiting for the user), closed = done
    status: { type: String, enum: ["open", "answered", "closed"], default: "open", index: true },
    page: { type: Schema.Types.ObjectId, ref: "MemoryPage", default: null },
    messages: { type: [messageSchema], default: [] },
    unreadByUser: { type: Boolean, default: false },
    unreadByAdmin: { type: Boolean, default: true },
    lastMessageAt: { type: Date, default: Date.now },
    closedAt: { type: Date, default: null },
    closedBy: { type: String, enum: ["user", "admin", null], default: null },
    reopenCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

memoryTicketSchema.index({ user: 1, lastMessageAt: -1 });
memoryTicketSchema.index({ status: 1, lastMessageAt: -1 });

export default mongoose.models.MemoryTicket || mongoose.model("MemoryTicket", memoryTicketSchema);
