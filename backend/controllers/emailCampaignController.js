import mongoose from "mongoose";
import EmailCampaign from "../models/EmailCampaign.js";
import sendMail from "../utils/MailSender.js";

const normalizeEmails = (emails) => {
  if (!emails) {
    return [];
  }

  let emailList = [];

  if (typeof emails === "string") {
    emailList = [emails];
  } else if (Array.isArray(emails)) {
    emailList = emails;
  } else {
    return [];
  }

  return [
    ...new Set(
      emailList
        .map((email) =>
          String(email).trim().toLowerCase()
        )
        .filter(Boolean)
    ),
  ];
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const htmlToText = (html = "") => {
  return String(html)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();
};

export const sendEmailCampaign = async (req, res) => {
  let campaign = null;

  try {
    const {
      subject,
      html,
      emails,
    } = req.body;

    if (!subject || !String(subject).trim()) {
      return res.status(400).json({
        success: false,
        message: "Email subject is required.",
      });
    }

    if (!html || !String(html).trim()) {
      return res.status(400).json({
        success: false,
        message: "Email HTML body is required.",
      });
    }

    const normalizedEmails = normalizeEmails(emails);

    if (normalizedEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one email address is required.",
      });
    }

    const invalidEmails = normalizedEmails.filter(
      (email) => !isValidEmail(email)
    );

    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some email addresses are invalid.",
        invalidEmails,
      });
    }

    const subjectValue = String(subject).trim();

    const htmlValue = String(html);

    const textValue = htmlToText(htmlValue);

    const recipients = normalizedEmails.map((email) => ({
      email,
      status: "PENDING",
      sentAt: null,
      failedAt: null,
      error: "",
      messageId: "",
    }));

    campaign = await EmailCampaign.create({
      subject: subjectValue,

      html: htmlValue,

      text: textValue,

      recipients,

      totalEmails: normalizedEmails.length,

      successCount: 0,

      failedCount: 0,

      pendingCount: normalizedEmails.length,

      status: "PROCESSING",

      startedAt: new Date(),
    });

    for (const email of normalizedEmails) {
      try {
        const mailResponse = await sendMail(
          email,
          subjectValue,
          textValue,
          htmlValue
        );

        const messageId =
          mailResponse?.messageId
            ? String(mailResponse.messageId)
            : "";

        await EmailCampaign.updateOne(
          {
            _id: campaign._id,
            "recipients.email": email,
          },
          {
            $set: {
              "recipients.$.status": "SENT",
              "recipients.$.sentAt": new Date(),
              "recipients.$.failedAt": null,
              "recipients.$.error": "",
              "recipients.$.messageId": messageId,
            },

            $inc: {
              successCount: 1,
              pendingCount: -1,
            },
          }
        );
      } catch (error) {
        await EmailCampaign.updateOne(
          {
            _id: campaign._id,
            "recipients.email": email,
          },
          {
            $set: {
              "recipients.$.status": "FAILED",
              "recipients.$.failedAt": new Date(),
              "recipients.$.sentAt": null,
              "recipients.$.error":
                error?.message || "Failed to send email.",
            },

            $inc: {
              failedCount: 1,
              pendingCount: -1,
            },
          }
        );
      }
    }

    campaign = await EmailCampaign.findById(campaign._id);

    let finalStatus = "COMPLETED";

    if (
      campaign.failedCount > 0 &&
      campaign.successCount > 0
    ) {
      finalStatus = "PARTIAL_SUCCESS";
    }

    if (
      campaign.failedCount === campaign.totalEmails
    ) {
      finalStatus = "FAILED";
    }

    campaign.status = finalStatus;
    campaign.completedAt = new Date();
    campaign.pendingCount = 0;

    await campaign.save();

    return res.status(200).json({
      success: true,

      message: "Email campaign processed successfully.",

      campaign: {
        id: campaign._id,

        subject: campaign.subject,

        totalEmails: campaign.totalEmails,

        successCount: campaign.successCount,

        failedCount: campaign.failedCount,

        pendingCount: campaign.pendingCount,

        status: campaign.status,

        startedAt: campaign.startedAt,

        completedAt: campaign.completedAt,

        createdAt: campaign.createdAt,
      },
    });
  } catch (error) {
    if (campaign?._id) {
      try {
        const currentCampaign =
          await EmailCampaign.findById(campaign._id);

        if (currentCampaign) {
          if (
            currentCampaign.successCount > 0 &&
            currentCampaign.failedCount > 0
          ) {
            currentCampaign.status = "PARTIAL_SUCCESS";
          } else if (
            currentCampaign.successCount > 0
          ) {
            currentCampaign.status = "PARTIAL_SUCCESS";
          } else {
            currentCampaign.status = "FAILED";
          }

          await currentCampaign.save();
        }
      } catch (dbError) {
        console.error(
          "Failed to update campaign after error:",
          dbError
        );
      }
    }

    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Failed to process email campaign.",
    });
  }
};

export const getAllEmailCampaigns = async (req, res) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 20,
        1
      ),
      100
    );

    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) {
      filter.status = String(
        req.query.status
      ).toUpperCase();
    }

    if (req.query.search) {
      filter.$or = [
        {
          subject: {
            $regex: String(req.query.search),
            $options: "i",
          },
        },

        {
          "recipients.email": {
            $regex: String(req.query.search),
            $options: "i",
          },
        },
      ];
    }

    const [campaigns, total] = await Promise.all([
      EmailCampaign.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      EmailCampaign.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,

      page,

      limit,

      total,

      totalPages: Math.ceil(total / limit),

      campaigns,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Failed to fetch email campaigns.",
    });
  }
};

export const hardDeleteEmailCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(campaignId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID.",
      });
    }

    const campaign =
      await EmailCampaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Email campaign not found.",
      });
    }

    await EmailCampaign.findByIdAndDelete(campaignId);

    return res.status(200).json({
      success: true,
      message: "Email campaign permanently deleted.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message:
        error?.message ||
        "Failed to delete email campaign.",
    });
  }
};