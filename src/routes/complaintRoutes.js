const multer = require("multer");
const path = require("path");
const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  getComplaintById
} = require("../controllers/complaintController");

// 📦 Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Student
router.post("/", protect, upload.single("attachment"), createComplaint);
router.get("/my", protect, getMyComplaints);

// Admin
router.get("/", protect, adminOnly, getAllComplaints);
router.get("/:id", protect, getComplaintById);
router.put("/:id", protect, adminOnly, updateComplaintStatus);

module.exports = router;