const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      enum: ["academic", "hostel", "infrastructure", "other"],
      required: true
    },

    status: {
      type: String,
      enum: [
        "submitted",
        "under_review",
        "in_progress",
        "resolved",
        "rejected"
      ],
      default: "submitted"
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // 🔥 NEW: Timeline history
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "submitted",
            "under_review",
            "in_progress",
            "resolved",
            "rejected"
          ]
        },
        changedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    //  Public response visible to student
    publicResponse: {
      type: String,
      default: ""
    },

    //  Internal admin-only remarks
    internalRemarks: {
      type: String,
      default: ""
    },
    // Image upload
    image: {
      type: String,
      default: null
    },
    // Complaint ID
    complaintId: {
      type: String,
      unique: true
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);