const Complaint = require("../models/Complaint");

// Submit Complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const imagePath = req.file ? req.file.filename : null;

    //  CATEGORY MAP
    const categoryMap = {
      academic: "ACA",
      infrastructure: "INF",
      hostel: "HOS",
      other: "OTH"
    };

    const prefix = categoryMap[category] || "CMP";

    //  CURRENT YEAR
    const year = new Date().getFullYear();

    //  COUNT same category + same year
    const count = await Complaint.countDocuments({
      category,
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`)
      }
    });

    //  GENERATE ID
    const sequence = String(count + 1).padStart(3, "0");
    const complaintId = `${prefix}-${year}-${sequence}`;

    //  CREATE
    const complaint = await Complaint.create({
      complaintId,
      title,
      description,
      category,
      student: req.user.id,
      image: imagePath,
      statusHistory: [
        {
          status: "submitted",
          changedAt: new Date()
        }
      ]
    });

    res.status(201).json({
      message: "Complaint created successfully",
      complaint
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 📂 Get My Complaints (Student)
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      student: req.user.id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: complaints.length,
      complaints
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 📂 Admin: Get All Complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: complaints.length,
      complaints
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 🔄 Admin: Update Complaint Status
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, priority, publicResponse, internalRemarks } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // 🔹 If status changed → push to history
    if (status && status !== complaint.status) {
      complaint.status = status;

      complaint.statusHistory.push({
        status: status,
        changedAt: new Date()
      });
    }

    // 🔹 Update priority if provided
    if (priority) {
      complaint.priority = priority;
    }

    // 🔹 Update public response
    if (publicResponse !== undefined) {
      complaint.publicResponse = publicResponse;
    }

    // 🔹 Update internal remarks
    if (internalRemarks !== undefined) {
      complaint.internalRemarks = internalRemarks;
    }

    await complaint.save();

    res.status(200).json({
      message: "Complaint updated successfully",
      complaint
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 📄 Admin: Get Single Complaint
exports.getComplaintById = async (req, res) => {
  try {

    const complaint = await Complaint.findById(req.params.id)
      .populate("student", "name email");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // If user is student, ensure they own the complaint
    if (
      req.user.role !== "admin" &&
      complaint.student._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(complaint);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};